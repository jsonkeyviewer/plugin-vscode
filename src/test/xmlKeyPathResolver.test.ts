import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
    getAllXmlKeys,
    resolveXmlKeyPathAt,
} from '../core/xmlKeyPathResolver';

// ── Helpers ────────────────────────────────────────────────────────────────

function paths(xml: string): string[] {
    return getAllXmlKeys(xml).map(e => e.path);
}

/** Resolves the path at the offset of the Nth (0-based) `<tag` occurrence. */
function resolveAtTag(xml: string, tag: string, occurrence = 0): string | undefined {
    const needle = `<${tag}`;
    let idx = -1;
    for (let i = 0; i <= occurrence; i++) {
        idx = xml.indexOf(needle, idx + 1);
        if (idx < 0) { throw new Error(`Tag '<${tag}>' #${occurrence} not found in: ${xml}`); }
    }
    return resolveXmlKeyPathAt(xml, idx + 1)?.path;
}

// ── Simple nested tags ──────────────────────────────────────────────────────

test('single root tag', () => {
    assert.equal(resolveAtTag('<root></root>', 'root'), 'root');
});

test('three levels', () => {
    const xml = '<server><database><host>localhost</host></database></server>';
    assert.equal(resolveAtTag(xml, 'host'), 'server.database.host');
});

// ── Repeated siblings ───────────────────────────────────────────────────────

test('adds indices for repeated siblings', () => {
    const xml = '<servers><server>a</server><server>b</server></servers>';
    const p = paths(xml);
    assert.ok(p.includes('servers'));
    assert.ok(p.includes('servers.server[0]'));
    assert.ok(p.includes('servers.server[1]'));
});

test('no index when tag name is unique', () => {
    const xml = '<servers><server>a</server></servers>';
    const p = paths(xml);
    assert.ok(p.includes('servers.server'));
    assert.ok(!p.includes('servers.server[0]'));
});

// ── Key/tag containing a dot ────────────────────────────────────────────────

test('tag with dot is escaped', () => {
    const xml = '<root><my.tag>x</my.tag></root>';
    assert.equal(resolveAtTag(xml, 'my.tag'), 'root."my.tag"');
});
