import {
    parseDocument,
    isMap,
    isSeq,
    isScalar,
    YAMLMap,
    YAMLSeq,
    Pair,
    Scalar,
    Node,
} from 'yaml';

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

function getRange(node: unknown): [number, number, number] | null {
    const n = node as { range?: [number, number, number] | null };
    return n?.range ?? null;
}

function getYamlValueType(value: unknown): string | undefined {
    if (isMap(value))    { return 'object'; }
    if (isSeq(value))    { return 'array';  }
    if (isScalar(value)) { return 'scalar'; }
    return undefined;
}

// ── Recursive AST traversal (hover) ───────────────────────────────────────

function traverseMap(
    node: YAMLMap,
    offset: number,
    segments: string[],
): KeyPathResult | null {
    for (const pair of node.items as Pair[]) {
        const result = traversePair(pair, offset, segments);
        if (result) { return result; }
    }
    return null;
}

function traversePair(
    pair: Pair,
    offset: number,
    segments: string[],
): KeyPathResult | null {
    const keyNode = pair.key as Scalar;
    if (!isScalar(keyNode)) { return null; }

    const keyRange = getRange(keyNode);
    if (!keyRange) { return null; }

    const valueNode  = pair.value;
    const valueRange = getRange(valueNode);
    const pairEnd    = valueRange ? valueRange[2] : keyRange[2];

    if (offset < keyRange[0] || offset > pairEnd) { return null; }

    const keyName    = String(keyNode.value);
    const newSegments = [...segments, escapeName(keyName)];

    // Try to go deeper into the value node.
    if (valueNode && (isMap(valueNode) || isSeq(valueNode))) {
        const deeper = traverseNode(valueNode as Node, offset, newSegments);
        if (deeper) { return deeper; }
    }

    // Cursor is on the key itself, or on a scalar value.
    return { path: newSegments.join('.'), valueType: getYamlValueType(valueNode) };
}

function traverseNode(
    node: Node,
    offset: number,
    segments: string[],
): KeyPathResult | null {
    const range = getRange(node);
    if (!range) { return null; }

    const [start, , end] = range;
    if (offset < start || offset > end) { return null; }

    if (isMap(node))  { return traverseMap(node as YAMLMap, offset, segments); }
    if (isSeq(node)) {
        const seq = node as YAMLSeq;
        for (let i = 0; i < seq.items.length; i++) {
            const item      = seq.items[i];
            const itemRange = getRange(item);
            if (!itemRange) { continue; }
            const [is, , ie] = itemRange;
            if (offset < is || offset > ie) { continue; }

            // Append [i] to the last accumulated segment (the owning key name).
            const indexedSegs = [...segments];
            if (indexedSegs.length > 0) {
                indexedSegs[indexedSegs.length - 1] += `[${i}]`;
            }
            return traverseNode(item as Node, offset, indexedSegs);
        }
    }
    return null;
}

// ── Public API – hover ─────────────────────────────────────────────────────

/**
 * Resolves the dot-notation path for the YAML key at the given text offset.
 * Pure function (no VSCode dependency) so it can be unit-tested in isolation.
 */
export function resolveYamlKeyPathAt(
    text: string,
    offset: number,
): KeyPathResult | null {
    try {
        const doc = parseDocument(text, { keepSourceTokens: true });
        if (!doc.contents) { return null; }
        return traverseNode(doc.contents as Node, offset, []);
    } catch {
        return null;
    }
}

// ── Public API – full-file enumeration (gutter / inlay hints) ─────────────

export function getAllYamlKeys(text: string): KeyEntry[] {
    try {
        const doc = parseDocument(text, { keepSourceTokens: true });
        if (!doc.contents) { return []; }
        const results: KeyEntry[] = [];
        collectNode(doc.contents as Node, [], results);
        return results;
    } catch {
        return [];
    }
}

function collectNode(node: Node, segments: string[], out: KeyEntry[]): void {
    if (isMap(node)) {
        for (const pair of (node as YAMLMap).items as Pair[]) {
            collectPair(pair, segments, out);
        }
    } else if (isSeq(node)) {
        const seq = node as YAMLSeq;
        for (let i = 0; i < seq.items.length; i++) {
            const indexedSegs = [...segments];
            if (indexedSegs.length > 0) {
                indexedSegs[indexedSegs.length - 1] += `[${i}]`;
            }
            collectNode(seq.items[i] as Node, indexedSegs, out);
        }
    }
}

function collectPair(pair: Pair, segments: string[], out: KeyEntry[]): void {
    const keyNode = pair.key;
    if (!isScalar(keyNode)) { return; }

    const keyRange = getRange(keyNode);
    if (!keyRange) { return; }

    const keyName     = String((keyNode as Scalar).value);
    const newSegments = [...segments, escapeName(keyName)];
    out.push({ path: newSegments.join('.'), offset: keyRange[0] });

    if (pair.value) {
        collectNode(pair.value as Node, newSegments, out);
    }
}

