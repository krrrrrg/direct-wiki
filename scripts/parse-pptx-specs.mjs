#!/usr/bin/env node
// Parse 직영점 사이즈 PPTX files → extract store name + 사이드광고 spec items per slide.
// Output: JSON report with parsed slides, normalized store matching against current stores.
//
// Usage:
//   node scripts/parse-pptx-specs.mjs \
//     "~/Downloads/직영점 사이즈 전달용(서울,경기,대전).pptx" \
//     "~/Downloads/직영점 사이즈 전달용 (부산, 경남).pptx"
//
// Reads stores from /tmp/stores.json (fetched via Supabase Management API beforehand).

import { mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, basename } from 'node:path';
import { tmpdir } from 'node:os';

const pptxFiles = process.argv.slice(2);
if (pptxFiles.length === 0) {
  console.error('usage: parse-pptx-specs.mjs <pptx1> [pptx2...]');
  process.exit(1);
}

const storesPath = '/tmp/stores.json';
if (!existsSync(storesPath)) {
  console.error(`missing ${storesPath} — fetch stores first via Supabase API`);
  process.exit(1);
}
const stores = JSON.parse(readFileSync(storesPath, 'utf8'));

function normalizeName(name) {
  return name
    .replace(/\s+/g, '')
    .replace(/^하카/, '')
    .replace(/전자담배/g, '')
    .replace(/RED/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/직영점$/, '')
    .toLowerCase();
}

const storeIndex = new Map();
for (const s of stores) storeIndex.set(normalizeName(s.name), s);

function extractText(xml) {
  const runs = [...xml.matchAll(/<a:t[^>]*>([^<]*)<\/a:t>/g)].map(m => m[1]);
  return runs;
}

function parseSlide(xml, sourceLabel, slideNum) {
  const runs = extractText(xml);
  const joined = runs.join('\n');

  const storeMatch = joined.match(/하카[^\n]*?직영점/);
  const storeName = storeMatch ? storeMatch[0].trim() : null;

  const sideIdx = runs.findIndex(r => /\[사이드광고\]/.test(r));
  const internalIdx = runs.findIndex(r => /내부\s*광고/.test(r));
  const sideMarkX = /\[사이드광고\]\s*X/.test(joined);

  const items = [];
  // Pattern A: WIDTHxHEIGHT * QTY개  (dominant 사이드광고 format, also appears in 내부광고)
  const reFull = /(\d{2,5})\s*[xX×]\s*(\d{2,5})\s*[*×xX]\s*(\d{1,3})\s*(?:개|ea|EA)/g;
  // Pattern B: WIDTH*HEIGHT (optionally followed by X{qty}ea)  (internal ad shorthand)
  const reShort = /(?<![\dxX×])(\d{2,5})\s*\*\s*(\d{2,5})(?:\s*[xX×]\s*(\d{1,3})\s*(?:ea|EA|개))?(?!\s*[*×xX]\s*\d)/g;

  function typeForIdx(pos) {
    if (sideIdx >= 0 && pos > indexOfRunInJoined(runs, sideIdx)) return '사이드광고';
    return '내부광고';
  }
  function indexOfRunInJoined(runs, idx) {
    let p = 0;
    for (let i = 0; i < idx; i++) p += runs[i].length + 1;
    return p;
  }

  let m;
  while ((m = reFull.exec(joined))) {
    items.push({
      item_type: typeForIdx(m.index),
      width: parseInt(m[1], 10),
      height: parseInt(m[2], 10),
      qty: parseInt(m[3], 10),
      raw: m[0],
    });
  }
  while ((m = reShort.exec(joined))) {
    // Skip if this substring was already captured by reFull (overlap guard)
    const width = parseInt(m[1], 10);
    const height = parseInt(m[2], 10);
    const qty = m[3] ? parseInt(m[3], 10) : 1;
    const dup = items.find(it => it.width === width && it.height === height);
    if (dup) continue;
    items.push({
      item_type: typeForIdx(m.index),
      width, height, qty,
      raw: m[0],
    });
  }

  return { source: sourceLabel, slide: slideNum, storeName, items, sideMarkX };
}

const tmpRoot = `${tmpdir()}/pptx-parse-${Date.now()}`;
mkdirSync(tmpRoot, { recursive: true });

const results = [];
for (const pptx of pptxFiles) {
  const abs = resolve(pptx.replace(/^~/, process.env.HOME));
  const label = basename(abs);
  const extractDir = `${tmpRoot}/${label.replace(/\s+/g, '_')}`;
  mkdirSync(extractDir, { recursive: true });
  execSync(`unzip -q -o "${abs}" -d "${extractDir}"`);

  const slidesDir = `${extractDir}/ppt/slides`;
  const slideFiles = readdirSync(slidesDir)
    .filter(f => /^slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10);
      const nb = parseInt(b.match(/\d+/)[0], 10);
      return na - nb;
    });

  for (const f of slideFiles) {
    const xml = readFileSync(`${slidesDir}/${f}`, 'utf8');
    const slideNum = parseInt(f.match(/\d+/)[0], 10);
    const parsed = parseSlide(xml, label, slideNum);
    if (parsed.storeName) results.push(parsed);
  }
}

const matched = [];
const unmatched = [];
for (const r of results) {
  const key = normalizeName(r.storeName);
  const hit = storeIndex.get(key);
  if (hit) {
    matched.push({ ...r, store_id: hit.id, db_name: hit.name, db_region: hit.region });
  } else {
    unmatched.push(r);
  }
}

const noItems = matched.filter(r => r.items.length === 0);

const report = {
  total_slides_with_store: results.length,
  matched_count: matched.length,
  unmatched_count: unmatched.length,
  no_side_items_count: noItems.length,
  matched,
  unmatched: unmatched.map(r => ({
    source: r.source,
    slide: r.slide,
    storeName: r.storeName,
    normalized: normalizeName(r.storeName),
    items: r.items,
  })),
};

writeFileSync('/tmp/pptx-report.json', JSON.stringify(report, null, 2));

console.log(`=== PARSE REPORT ===`);
console.log(`total slides with store name: ${results.length}`);
console.log(`  matched to stores table:    ${matched.length}`);
console.log(`  UNMATCHED (need insert):    ${unmatched.length}`);
console.log(`  matched but no side items:  ${noItems.length}`);
console.log(``);
if (unmatched.length > 0) {
  console.log(`--- UNMATCHED STORES ---`);
  for (const r of unmatched) {
    console.log(`  [${r.source} slide ${r.slide}] "${r.storeName}"  (normalized: "${normalizeName(r.storeName)}")`);
  }
  console.log(``);
}
if (noItems.length > 0) {
  console.log(`--- MATCHED BUT NO 사이드광고 ITEMS ---`);
  for (const r of noItems) {
    console.log(`  [${r.source} slide ${r.slide}] "${r.storeName}"`);
  }
  console.log(``);
}
console.log(`report saved to /tmp/pptx-report.json`);

rmSync(tmpRoot, { recursive: true, force: true });
