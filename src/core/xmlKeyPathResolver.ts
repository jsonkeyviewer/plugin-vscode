
// ── Types ──────────────────────────────────────────────────────────────────

export interface KeyPathResult {
    path: string;
    valueType?: string;
}

export interface KeyEntry {
    path:   string;
    offset: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeName(name: string): string {
    return name.includes('.') ? `"${name}"` : name;
}

/**
 * Regex that matches opening tags `<TagName …>`, self-closing tags `<TagName …/>`,
 * and closing tags `</TagName>`.  Group 1 = '/' when closing, group 2 = tag name,
 * group 3 = '/' when self-closing.
 */
const TAG_REGEX = /<(\/?)([a-zA-Z_][\w.-]*)[^>]*?(\/?)>/g;

// ── Stack entry ────────────────────────────────────────────────────────────

interface StackEntry {
    /** Tag name. */
    name: string;
    /** 0-based position of this tag among same-named siblings in its parent. */
    siblingIndex: number;
    /** Counts how many children of each name this entry has opened so far. */
    childCounts: Map<string, number>;
    /** Total count of same-named siblings, filled during the second pass. */
    totalSiblings: number;
}

// ── Core parser ────────────────────────────────────────────────────────────

/**
 * Parses the XML text to the given offset and returns the stack of open tags,
 * each carrying its sibling index among ALL same-named siblings (two-pass).
 *
 * Note: sibling indexing mirrors the IntelliJ implementation –- a tag only gets
 * an [n] suffix when it has at least one same-named sibling inside the same parent.
 */
function buildTagStack(text: string, offset: number): StackEntry[] {
    // ── Pass 1: collect every tag event up to the end of the document ────────
    interface TagEvent {
        tagName:      string;
        isClosing:    boolean;
        isSelfClosed: boolean;
        position:     number;
        endPosition:  number;
    }
    const events: TagEvent[] = [];
    const re = new RegExp(TAG_REGEX.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        events.push({
            tagName:      m[2],
            isClosing:    m[1] === '/',
            isSelfClosed: m[3] === '/',
            position:     m.index,
            endPosition:  m.index + m[0].length,
        });
    }

    // ── Pass 2: replay events, tracking sibling counts inside each parent ───

    interface OpenEntry {
        name:         string;
        siblingIndex: number;
        childCounts:  Map<string, number>; // counts added so far in this scope
    }

    // We also keep, for each depth, the total counts across the FULL document
    // so we can decide whether to show [n] at all.  We track this by a second
    // pass after building the full tree structure.

    // For now collect the per-parent total counts in a separate data structure.
    // Key = "parentDepth:parentName:childName" → total count
    const totalChildCounts = new Map<string, number>();

    // First sub-pass: collect totals
    const tempStack: string[] = ['__root__'];
    const tempDepthKey: string[] = ['0:__root__'];
    for (const ev of events) {
        if (ev.isClosing) {
            if (tempStack.length > 1 && tempStack[tempStack.length - 1] === ev.tagName) {
                tempStack.pop();
                tempDepthKey.pop();
            }
        } else {
            const parentKey = tempDepthKey[tempDepthKey.length - 1];
            const counterKey = `${parentKey}:${ev.tagName}`;
            totalChildCounts.set(counterKey, (totalChildCounts.get(counterKey) ?? 0) + 1);
            if (!ev.isSelfClosed) {
                tempStack.push(ev.tagName);
                tempDepthKey.push(`${tempStack.length - 1}:${ev.tagName}`);
            }
        }
    }

    // Second sub-pass: replay up to offset, building the real stack
    const stack: StackEntry[] = [];
    const replayStack: OpenEntry[] = [{ name: '__root__', siblingIndex: 0, childCounts: new Map() }];
    const replayDepthKey: string[] = ['0:__root__'];

    for (const ev of events) {
        if (ev.position > offset) { break; }

        if (ev.isClosing) {
            if (replayStack.length > 1 && replayStack[replayStack.length - 1].name === ev.tagName) {
                replayStack.pop();
                replayDepthKey.pop();
                stack.pop();
            }
        } else {
            const parent     = replayStack[replayStack.length - 1];
            const parentDKey = replayDepthKey[replayDepthKey.length - 1];
            const count      = parent.childCounts.get(ev.tagName) ?? 0;
            parent.childCounts.set(ev.tagName, count + 1);

            const counterKey    = `${parentDKey}:${ev.tagName}`;
            const totalSiblings = totalChildCounts.get(counterKey) ?? 1;

            const entry: StackEntry = {
                name:         ev.tagName,
                siblingIndex: count,
                childCounts:  new Map(),
                totalSiblings,
            };

            if (ev.isSelfClosed) {
                if (offset < ev.endPosition) {
                    stack.push(entry);
                }
            } else {
                replayStack.push({ name: ev.tagName, siblingIndex: count, childCounts: new Map() });
                replayDepthKey.push(`${replayStack.length - 1}:${ev.tagName}`);
                stack.push(entry);
            }
        }
    }

    return stack;
}

// ── Public API – hover ─────────────────────────────────────────────────────

/**
 * Resolves the dot-notation path for the XML tag at the given text offset.
 * Pure function (no VSCode dependency) so it can be unit-tested in isolation.
 */
export function resolveXmlKeyPathAt(
    text: string,
    offset: number,
): KeyPathResult | null {

    const stack = buildTagStack(text, offset);
    if (stack.length === 0) { return null; }

    // Build path; append [n] only when a tag has same-named siblings.
    const segments = stack.map(entry => {
        const name    = escapeName(entry.name);
        const hasDups = entry.totalSiblings > 1;
        return hasDups ? `${name}[${entry.siblingIndex}]` : name;
    });

    return { path: segments.join('.'), valueType: stack[stack.length - 1].childCounts.size > 0 ? 'element' : 'text' };
}

// ── Public API – full-file enumeration (gutter / inlay hints) ─────────────

/**
 * Returns every XML opening-tag position and its full dot-notation path.
 * Self-closing tags are included because they are still addressable config keys.
 *
 * NOTE: sibling indexing is included (same logic as above).
 */
export function getAllXmlKeys(text: string): KeyEntry[] {
    const results: KeyEntry[] = [];

    interface OpenEntry {
        name:         string;
        siblingIndex: number;
        childCounts:  Map<string, number>;
        totalSiblings: number;
        pathSoFar:    string;
        startOffset:  number;
    }

    // Collect total sibling counts first (same as above).
    const totalChildCounts = new Map<string, number>();
    const tempStack: string[] = ['__root__'];
    const tempDepthKey: string[] = ['0:__root__'];
    const re = new RegExp(TAG_REGEX.source, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        const isClosing    = m[1] === '/';
        const tagName      = m[2];
        const isSelfClosed = m[3] === '/';
        if (isClosing) {
            if (tempStack.length > 1 && tempStack[tempStack.length - 1] === tagName) {
                tempStack.pop();
                tempDepthKey.pop();
            }
        } else {
            const parentKey  = tempDepthKey[tempDepthKey.length - 1];
            const counterKey = `${parentKey}:${tagName}`;
            totalChildCounts.set(counterKey, (totalChildCounts.get(counterKey) ?? 0) + 1);
            if (!isSelfClosed) {
                tempStack.push(tagName);
                tempDepthKey.push(`${tempStack.length - 1}:${tagName}`);
            }
        }
    }

    // Replay to collect paths.
    const stack: OpenEntry[] = [{ name: '__root__', siblingIndex: 0, childCounts: new Map(), totalSiblings: 1, pathSoFar: '', startOffset: 0 }];
    const depthKey: string[] = ['0:__root__'];
    const re2 = new RegExp(TAG_REGEX.source, 'g');
    while ((m = re2.exec(text)) !== null) {
        const isClosing    = m[1] === '/';
        const tagName      = m[2];
        const isSelfClosed = m[3] === '/';
        const tagStart     = m.index;

        if (isClosing) {
            if (stack.length > 1 && stack[stack.length - 1].name === tagName) {
                stack.pop();
                depthKey.pop();
            }
        } else {
            const parent      = stack[stack.length - 1];
            const parentDKey  = depthKey[depthKey.length - 1];
            const count       = parent.childCounts.get(tagName) ?? 0;
            parent.childCounts.set(tagName, count + 1);

            const counterKey    = `${parentDKey}:${tagName}`;
            const totalSiblings = totalChildCounts.get(counterKey) ?? 1;

            const escaped  = escapeName(tagName);
            const segment  = totalSiblings > 1 ? `${escaped}[${count}]` : escaped;
            const newPath  = parent.pathSoFar ? `${parent.pathSoFar}.${segment}` : segment;

            results.push({ path: newPath, offset: tagStart });

            if (!isSelfClosed) {
                const entry: OpenEntry = {
                    name:          tagName,
                    siblingIndex:  count,
                    childCounts:   new Map(),
                    totalSiblings,
                    pathSoFar:     newPath,
                    startOffset:   tagStart,
                };
                stack.push(entry);
                depthKey.push(`${stack.length - 1}:${tagName}`);
            }
        }
    }

    return results;
}

