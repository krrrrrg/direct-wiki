#!/usr/bin/env node
// Seed signage_specs + signage_surveys from /tmp/pptx-report.json into Supabase.
// Requires SUPABASE_ACCESS_TOKEN env.
//
// Policy (per user decision):
//   - All items tagged as '사이드광고'
//   - All matched stores (including those with 0 items) get a signage_surveys row
//
// Usage: node scripts/seed-signage-specs.mjs

import { readFileSync } from 'node:fs';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) {
  console.error('SUPABASE_ACCESS_TOKEN env not set');
  process.exit(1);
}
const PROJECT_REF = 'byfjmrkjtgixkhhajdkp';

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

function sqlLit(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

const report = JSON.parse(readFileSync('/tmp/pptx-report.json', 'utf8'));
if (report.unmatched_count > 0) {
  console.error(`refuse: ${report.unmatched_count} unmatched stores still in report. Insert them first.`);
  process.exit(1);
}

// Group slides by store (some stores may appear in multiple slides if PPTX has that pattern).
const bystore = new Map();
for (const r of report.matched) {
  if (!bystore.has(r.store_id)) bystore.set(r.store_id, { store_id: r.store_id, db_name: r.db_name, items: [] });
  bystore.get(r.store_id).items.push(...r.items);
}

console.log(`preparing seed for ${bystore.size} stores, total ${[...bystore.values()].reduce((a, s) => a + s.items.length, 0)} items`);

// 1) Upsert signage_surveys: one per matched store.
const surveyValues = [...bystore.keys()].map(sid => `(${sqlLit(sid)})`).join(',');
const surveySql = `insert into signage_surveys (store_id) values ${surveyValues} on conflict (store_id) do nothing returning id, store_id`;
const surveys = await query(surveySql);
console.log(`surveys inserted: ${surveys.length}`);

// Fetch all surveys (new + existing) to get store_id -> survey_id map for later use in UI tests.
const allSurveys = await query(`select id, store_id from signage_surveys`);
console.log(`total surveys now: ${allSurveys.length}`);

// 2) Clear existing signage_specs rows for these stores (idempotent re-seed).
const storeIds = [...bystore.keys()].map(sqlLit).join(',');
await query(`delete from signage_specs where store_id in (${storeIds})`);

// 3) Insert signage_specs rows. Per user policy:
//    - item_type = '사이드광고' for all
//    - Split qty > 1 into individual qty=1 rows (one card per physical sign in UI)
const specRows = [];
for (const { store_id, items } of bystore.values()) {
  let sortOrder = 0;
  for (const it of items) {
    const count = Math.max(1, it.qty || 1);
    for (let k = 0; k < count; k++) {
      specRows.push(`(${sqlLit(store_id)}, '사이드광고', ${sqlLit(it.width)}, ${sqlLit(it.height)}, 1, ${sortOrder++})`);
    }
  }
}

if (specRows.length === 0) {
  console.log('no specs to insert');
} else {
  // Chunk to stay under query size limits.
  const chunkSize = 500;
  for (let i = 0; i < specRows.length; i += chunkSize) {
    const chunk = specRows.slice(i, i + chunkSize);
    await query(`insert into signage_specs (store_id, item_type, width, height, qty, sort_order) values ${chunk.join(',')}`);
    console.log(`  inserted ${Math.min(i + chunkSize, specRows.length)}/${specRows.length}`);
  }
}

const counts = await query(`select
  (select count(*) from signage_surveys) as surveys,
  (select count(*) from signage_specs) as specs`);
console.log(`\n=== FINAL ===`);
console.log(`surveys: ${counts[0].surveys}`);
console.log(`specs:   ${counts[0].specs}`);
