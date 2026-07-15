import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
    getAllJsonKeys,
    resolveJsonKeyPathAt,
} from '../core/jsonKeyPathResolver';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Resolves the path at the first offset where `keyName` appears as a key. */
function resolveAt(json: string, keyName: string): string | undefined {
    const marker = `"${keyName}"`;
    const idx = json.indexOf(marker);
    if (idx < 0) { throw new Error(`Key '${keyName}' not found in: ${json}`); }
    // Put the offset inside the key token.
    return resolveJsonKeyPathAt(json, idx + 1)?.path;
}

// ── Simple nested object ──────────────────────────────────────────────────

test('root level key', () => {
    assert.equal(resolveAt('{"host": "localhost"}', 'host'), 'host');
});

test('two levels', () => {
    assert.equal(resolveAt('{"server": {"host": "localhost"}}', 'host'), 'server.host');
});

test('three levels', () => {
    assert.equal(
        resolveAt('{"server": {"database": {"host": "localhost"}}}', 'host'),
        'server.database.host',
    );
});

// ── Arrays ────────────────────────────────────────────────────────────────

test('array first element', () => {
    assert.equal(
        resolveAt('{"servers": [{"host": "localhost"}]}', 'host'),
        'servers[0].host',
    );
});

test('array indices via full enumeration', () => {
    const paths = getAllJsonKeys('{"servers": [{"host": "a"}, {"host": "b"}]}').map(k => k.path);
    assert.ok(paths.includes('servers'));
    assert.ok(paths.includes('servers[0].host'));
    assert.ok(paths.includes('servers[1].host'));
});

test('deeply nested arrays', () => {
    const paths = getAllJsonKeys('{"a": [[{"b": 1}]]}').map(k => k.path);
    assert.ok(paths.includes('a'));
    assert.ok(paths.includes('a[0][0].b'));
});

// ── Key containing a dot ──────────────────────────────────────────────────

test('key with dot is escaped', () => {
    assert.equal(resolveAt('{"my.key": {"child": "value"}}', 'child'), '"my.key".child');
});
