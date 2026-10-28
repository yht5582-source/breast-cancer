// node tests.cjs — tests the engine block (/*ENGINE-START*/…/*ENGINE-END*/) in index.html
const fs = require('fs'), path = require('path'), assert = require('assert');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const src = html.slice(html.indexOf('/*ENGINE-START*/'), html.indexOf('/*ENGINE-END*/'));
const BC = new Function('module', src + '\nreturn BC;')({});
let n = 0;
const t = (name, fn) => { fn(); n++; };

// classify
t('HR+/HER2-', () => { const r = BC.classify({ er: 85, pr: 60, ihc: 0, ish: 'unknown' }); assert.equal(r.key, 'hr'); assert.ok(r.nhi30); });
t('IHC 3+ is HER2+', () => assert.equal(BC.classify({ er: 0, pr: 0, ihc: 3 }).key, 'her2'));
t('IHC 2+ ISH unknown pending', () => { const r = BC.classify({ er: 50, pr: 0, ihc: 2, ish: 'unknown' }); assert.ok(!r.ok && r.pending); });
t('IHC 2+ ISH pos HER2+', () => assert.equal(BC.classify({ er: 50, pr: 0, ihc: 2, ish: 'pos' }).key, 'her2'));
t('IHC 2+ ISH neg HER2-low', () => { const r = BC.classify({ er: 0, pr: 0, ihc: 2, ish: 'neg' }); assert.equal(r.key, 'tnbc'); assert.ok(r.her2low); });
t('IHC 1+ ignores ISH pos', () => assert.equal(BC.classify({ er: 0, pr: 0, ihc: 1, ish: 'pos' }).key, 'tnbc'));
t('empty ER rejected', () => assert.ok(!BC.classify({ er: '', pr: 5, ihc: 0 }).ok));
t('ER >100 rejected', () => assert.ok(!BC.classify({ er: 120, pr: 5, ihc: 0 }).ok));
t('ER-low flagged, TNBC-like note', () => { const r = BC.classify({ er: 5, pr: 0, ihc: 0 }); assert.ok(r.erLow); assert.equal(r.key, 'hr'); assert.ok(r.notes.some(s => s.includes('TNBC'))); assert.ok(!r.nhi30); });
t('ER 10 is ER-low; ER 11 not', () => { assert.ok(BC.classify({ er: 10, pr: 0, ihc: 0 }).erLow); assert.ok(!BC.classify({ er: 11, pr: 0, ihc: 0 }).erLow); });
t('>30% threshold strict', () => { assert.ok(!BC.classify({ er: 30, pr: 30, ihc: 0 }).nhi30); assert.ok(BC.classify({ er: 0, pr: 31, ihc: 0 }).nhi30); });
t('HER2-low HR+ not T-DXd NHI', () => assert.ok(BC.classify({ er: 90, pr: 0, ihc: 1 }).nhi.some(s => s.includes('不符'))));
t('HER2-low HR- T-DXd NHI possible', () => assert.ok(BC.classify({ er: 0, pr: 0, ihc: 1 }).nhi.some(s => s.includes('9.115-2') && !s.includes('不符'))));

// options + plans
t('meta options are lines', () => assert.deepEqual(BC.options('meta').risk.map(r => r[0]), ['first', 'post', 'later']));
t('early has no crisis/brain', () => assert.ok(!BC.options('early').special.some(s => ['crisis', 'brain'].includes(s[0]))));
for (const setting of ['early', 'meta']) for (const subtype of ['hr', 'her2', 'tnbc']) for (const [risk] of BC.options(setting).risk) for (const [special] of BC.options(setting).special)
  t(`plan ${setting}/${subtype}/${risk}/${special}`, () => { const p = BC.plan({ setting, subtype, risk, special }); assert.ok(p.intl.length && p.tw.length); });
t('stale risk falls back', () => assert.ok(BC.plan({ setting: 'meta', subtype: 'hr', risk: 'pcr', special: 'none' }).intl.length));
t('TNBC pCR: NHI no adjuvant pembro', () => assert.ok(BC.plan({ setting: 'early', subtype: 'tnbc', risk: 'pcr', special: 'none' }).tw.join().includes('non-pCR')));
t('early olaparib not listed', () => assert.ok(BC.plan({ setting: 'early', subtype: 'hr', risk: 'high', special: 'brca' }).tw.join().includes('自費')));
t('meta TNBC pembro not listed', () => assert.ok(BC.plan({ setting: 'meta', subtype: 'tnbc', risk: 'first', special: 'none' }).tw.join().includes('不在 9.69')));
t('meta HR+ PARP not covered', () => assert.ok(BC.plan({ setting: 'meta', subtype: 'hr', risk: 'post', special: 'brca' }).tw.join().includes('HR+/HER2− gBRCA 不給付')));
t('CKD: ICI eGFR rule', () => assert.ok(BC.plan({ setting: 'early', subtype: 'tnbc', risk: 'high', special: 'ckd' }).tw.join().includes('eGFR >60')));

// abemaciclib 9.107
const ab = o => BC.abema({ er: 90, pr: 50, her2neg: true, paln: 5, size: 3.6, grade: '2', chemoRT: true, etWeeks: 4, months: 6, ...o });
t('abema eligible pALN>=4', () => assert.equal(ab().status, 'ok'));
t('abema ER/PR <=30 fails', () => assert.equal(ab({ er: 10, pr: 0 }).status, 'no'));
t('abema pALN 2 + G2 + 3cm fails', () => assert.equal(ab({ paln: 2 }).status, 'no'));
t('abema pALN 2 + G3 ok', () => assert.equal(ab({ paln: 2, grade: '3' }).status, 'ok'));
t('abema pALN 2 + 5cm ok', () => assert.equal(ab({ paln: 2, size: 5 }).status, 'ok'));
t('abema N0 fails', () => assert.equal(ab({ paln: 0 }).status, 'no'));
t('abema ET 13 wk fails', () => assert.equal(ab({ etWeeks: 13 }).status, 'no'));
t('abema 17 mo fails', () => assert.equal(ab({ months: 17 }).status, 'no'));
t('abema 16 mo ok', () => assert.equal(ab({ months: 16 }).status, 'ok'));
t('abema no chemoRT fails', () => assert.equal(ab({ chemoRT: false }).status, 'no'));
t('abema HER2+ fails', () => assert.equal(ab({ her2neg: false }).status, 'no'));
t('abema missing months -> na', () => assert.equal(ab({ months: '' }).status, 'na'));

// T-DM1 9.87
const td = o => BC.tdm1({ chemo: 6, taxane: 4, trast: 6, residual: true, nodes: 1, er: 10, size: 3, weeks: 4, lvef: 63, hf: false, ...o });
t('tdm1 eligible N+', () => assert.equal(td().status, 'ok'));
t('tdm1 5 chemo fails', () => assert.equal(td({ chemo: 5 }).status, 'no'));
t('tdm1 2 taxane fails', () => assert.equal(td({ taxane: 2 }).status, 'no'));
t('tdm1 2 trastuzumab fails', () => assert.equal(td({ trast: 2 }).status, 'no'));
t('tdm1 pCR fails', () => assert.equal(td({ residual: false }).status, 'no'));
t('tdm1 N0 ER+ fails', () => assert.equal(td({ nodes: 0, er: 10 }).status, 'no'));
t('tdm1 N0 ER- 2cm fails', () => assert.equal(td({ nodes: 0, er: 0, size: 2 }).status, 'no'));
t('tdm1 N0 ER- 2.5cm ok', () => assert.equal(td({ nodes: 0, er: 0, size: 2.5 }).status, 'ok'));
t('tdm1 13 wk fails', () => assert.equal(td({ weeks: 13 }).status, 'no'));
t('tdm1 LVEF 44 fails', () => assert.equal(td({ lvef: 44 }).status, 'no'));
t('tdm1 LVEF 45 ok', () => assert.equal(td({ lvef: 45 }).status, 'ok'));
t('tdm1 HF fails', () => assert.equal(td({ hf: true }).status, 'no'));

console.log(`ok — ${n} tests passed`);
