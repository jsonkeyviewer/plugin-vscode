import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
    getAllYamlKeys,
    resolveYamlKeyPathAt,
} from '../core/yamlKeyPathResolver';

// ── Helpers ────────────────────────────────────────────────────────────────

function paths(yaml: string): string[] {
    return getAllYamlKeys(yaml).map(e => e.path);
}

/** Resolves the path at the first offset where `keyName` appears as a key. */
function resolveAt(yaml: string, keyName: string): string | undefined {
    const idx = yaml.indexOf(keyName);
    if (idx < 0) { throw new Error(`Key '${keyName}' not found in: ${yaml}`); }
    return resolveYamlKeyPathAt(yaml, idx)?.path;
}

// ── Simple nested object ──────────────────────────────────────────────────

test('root level key', () => {
    assert.equal(resolveAt('host: localhost', 'host'), 'host');
});

test('three levels', () => {
    const yaml = 'server:\n  database:\n    host: localhost';
    assert.equal(resolveAt(yaml, 'host'), 'server.database.host');
});

// ── Sequences ─────────────────────────────────────────────────────────────

test('sequence indices via full enumeration', () => {
    const yaml = [
        'servers:',
        '  - host: a',
        '    port: 8080',
        '  - host: b',
        '    port: 9090',
    ].join('\n');
    const p = paths(yaml);
    assert.ok(p.includes('servers'));
    assert.ok(p.includes('servers[0].host'));
    assert.ok(p.includes('servers[0].port'));
    assert.ok(p.includes('servers[1].host'));
    assert.ok(p.includes('servers[1].port'));
});

// ── Key containing a dot ──────────────────────────────────────────────────

test('key with dot is escaped', () => {
    const yaml = '"my.key":\n  child: 1';
    const p = paths(yaml);
    assert.ok(p.includes('"my.key"'));
    assert.ok(p.includes('"my.key".child'));
});
