#!/usr/bin/env node
// Extract pages from the two 전달용 PDFs, upload each store's page(s) to Supabase
// Storage (bucket: signage-references), and insert signage_reference_images rows.
//
// Assumes slide N in PPTX === page N in PDF (direct export).
//
// Usage:
//   SUPABASE_ACCESS_TOKEN=sbp_... \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
//     node scripts/extract-pdf-pages.mjs

import { execSync } from 'node:child_process';
import { readFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const PROJECT_REF = 'byfjmrkjtgixkhhajdkp';
const PROJECT_URL = `https://${PROJECT_REF}.supabase.co`;
const BUCKET = 'signage-references';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!TOKEN || !SERVICE_KEY) {
  console.error('SUPABASE_ACCESS_TOKEN and SUPABASE_SERVICE_ROLE_KEY env required');
  process.exit(1);
}

const PDFs = {
  '직영점 사이즈 전달용(서울,경기,대전).pptx': '/Users/krrrrrng/Downloads/직영점 사이즈 전달용(서울,경기,대전).pdf',
  '직영점 사이즈 전달용 (부산, 경남).pptx': '/Users/krrrrrng/Downloads/직영점 사이즈 전달용 (부산, 경남).pdf',
};

async function mgmtQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

async function uploadObject(path, bodyBuffer) {
  const url = `${PROJECT_URL}/storage/v1/object/${BUCKET}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      'Content-Type': 'image/jpeg',
      'x-upsert': 'true',
    },
    body: bodyBuffer,
  });
  if (!res.ok) throw new Error(`upload ${path} failed: ${res.status} ${await res.text()}`);
  return `${PROJECT_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

function sqlLit(v) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

const report = JSON.parse(readFileSync('/tmp/pptx-report.json', 'utf8'));
if (report.unmatched_count > 0) {
  console.error('unmatched stores in report — resolve first');
  process.exit(1);
}

const workdir = `${tmpdir()}/pdf-extract-${Date.now()}`;
mkdirSync(workdir, { recursive: true });

// 1) Convert each PDF to per-page JPEGs
for (const [pptxName, pdfPath] of Object.entries(PDFs)) {
  const prefix = `${workdir}/${pptxName.replace(/[^a-zA-Z0-9가-힣]/g, '_')}`;
  console.log(`converting ${pdfPath} ...`);
  execSync(`pdftoppm -jpeg -r 150 "${pdfPath}" "${prefix}"`, { stdio: 'inherit' });
}

const pageFilesBySource = {};
for (const pptxName of Object.keys(PDFs)) {
  const prefix = pptxName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
  const map = {};
  for (const f of readdirSync(workdir)) {
    if (!f.startsWith(prefix + '-') || !f.endsWith('.jpg')) continue;
    const pageMatch = f.match(/-(\d+)\.jpg$/);
    if (pageMatch) map[parseInt(pageMatch[1], 10)] = `${workdir}/${f}`;
  }
  pageFilesBySource[pptxName] = map;
}

// 2) Clear existing reference_images rows for these stores (idempotent re-run)
const storeIds = [...new Set(report.matched.map(r => r.store_id))];
await mgmtQuery(`delete from signage_reference_images where store_id in (${storeIds.map(sqlLit).join(',')})`);

// 3) Group slides by store (multiple slides possible per store)
const byStore = new Map();
for (const r of report.matched) {
  if (!byStore.has(r.store_id)) byStore.set(r.store_id, []);
  byStore.get(r.store_id).push({ source: r.source, slide: r.slide });
}

// 4) Upload each page, collect rows
const rows = [];
let uploaded = 0;
let failed = 0;

for (const [storeId, slides] of byStore) {
  slides.sort((a, b) => a.slide - b.slide);
  for (let i = 0; i < slides.length; i++) {
    const { source, slide } = slides[i];
    const pagePath = pageFilesBySource[source]?.[slide];
    if (!pagePath) {
      console.warn(`missing page for store ${storeId} source=${source} slide=${slide}`);
      failed++;
      continue;
    }
    const size = statSync(pagePath).size;
    const body = readFileSync(pagePath);
    const storagePath = `${storeId}/${i}.jpg`;
    try {
      const publicUrl = await uploadObject(storagePath, body);
      rows.push(`(${sqlLit(storeId)}, ${sqlLit(publicUrl)}, ${i})`);
      uploaded++;
      if (uploaded % 20 === 0) console.log(`  uploaded ${uploaded} pages... (last: ${storageSizeKb(size)})`);
    } catch (err) {
      console.error(`failed ${storagePath}: ${err.message}`);
      failed++;
    }
  }
}

function storageSizeKb(b) { return `${Math.round(b / 1024)}kb`; }

console.log(`\nupload summary: ${uploaded} ok, ${failed} failed`);

if (rows.length === 0) {
  console.log('no rows to insert');
} else {
  const chunkSize = 200;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await mgmtQuery(`insert into signage_reference_images (store_id, image_url, sort_order) values ${chunk.join(',')}`);
    console.log(`  inserted ${Math.min(i + chunkSize, rows.length)}/${rows.length} rows`);
  }
}

const counts = await mgmtQuery(`select count(*) as n from signage_reference_images`);
console.log(`\n=== FINAL ===\nreference_images rows: ${counts[0].n}`);

rmSync(workdir, { recursive: true, force: true });
