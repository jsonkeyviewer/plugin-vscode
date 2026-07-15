import * as jsonc from 'jsonc-parser';

// ── Types ──────────────────────────────────────────────────────────────────

export interface KeyPathResult {
    path: string;
    valueType?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeName(name: string): string {
    return name.includes('.') ? `"${name}"` : name;
}

function buildPathFromJsoncPath(jsonPath: jsonc.JSONPath): string {
    const segments: string[] = [];
    for (const segment of jsonPath) {
        if (typeof segment === 'string') {
            segments.push(escapeName(segment));
        } else if (typeof segment === 'number' && segments.length > 0) {
            segments[segments.length - 1] += `[${segment}]`;
        }
    }
    return segments.join('.');
}

function getValueType(node: jsonc.Node | undefined): string | undefined {
    if (!node) { return undefined; }
    switch (node.type) {
        case 'string':  return 'string';
        case 'number':  return 'number';
        case 'boolean': return 'boolean';
        case 'null':    return 'null';
        case 'array':   return 'array';
        case 'object':  return 'object';
        default:        return undefined;
    }
}

// ── Hover path resolution ──────────────────────────────────────────────────

/**
 * Returns the dot-notation path for the JSON key at the given text offset,
 * plus the inferred value type.  Returns null when the offset is not on a key.
 *
 * Pure function (no VSCode dependency) so it can be unit-tested in isolation.
 */
export function resolveJsonKeyPathAt(
    text: string,
    offset: number,
): KeyPathResult | null {

    const location = jsonc.getLocation(text, offset);
    if (location.path.length === 0) { return null; }

    // Skip when we are inside an array slot that is not itself a property key.
    const last = location.path[location.path.length - 1];
    if (typeof last === 'number' && !location.isAtPropertyKey) { return null; }

    const path = buildPathFromJsoncPath(location.path);
    if (!path) { return null; }

    const root      = jsonc.parseTree(text);
    const valueNode = root ? jsonc.findNodeAtLocation(root, location.path) : undefined;

    return { path, valueType: getValueType(valueNode) };
}

// ── Full-file key enumeration (for gutter / inlay hints) ───────────────────

export interface KeyEntry {
    path:   string;
    /** Start offset of the key token in the document text. */
    offset: number;
}

/**
 * Enumerates every JSON property in the document, returning its full dot-notation
 * path and the start offset of its key token (the opening quote of the key string).
 */
export function getAllJsonKeys(text: string): KeyEntry[] {
    const root = jsonc.parseTree(text);
    if (!root) { return []; }
    const results: KeyEntry[] = [];
    collectFromNode(root, '', results);
    return results;
}

function collectFromNode(node: jsonc.Node, currentPath: string, out: KeyEntry[]): void {
    switch (node.type) {
        case 'property': {
            if (!node.children || node.children.length < 2) { break; }
            const keyNode   = node.children[0];
            const valueNode = node.children[1];
            const rawName   = String(keyNode.value);
            const escaped   = escapeName(rawName);
            const newPath   = currentPath ? `${currentPath}.${escaped}` : escaped;
            out.push({ path: newPath, offset: keyNode.offset });
            collectFromNode(valueNode, newPath, out);
            break;
        }
        case 'object': {
            for (const child of (node.children ?? [])) {
                collectFromNode(child, currentPath, out);
            }
            break;
        }
        case 'array': {
            (node.children ?? []).forEach((child, i) => {
                const indexedPath = currentPath ? `${currentPath}[${i}]` : `[${i}]`;
                collectFromNode(child, indexedPath, out);
            });
            break;
        }
    }
}

