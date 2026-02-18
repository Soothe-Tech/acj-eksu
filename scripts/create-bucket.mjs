#!/usr/bin/env node
/**
 * One-time script to create the Supabase Storage bucket "acj-media" (public).
 * Requires: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Run: node scripts/create-bucket.mjs
 * Then run migrations/20250218000003_storage_policies.sql in Supabase SQL Editor.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const path = join(root, '.env.local');
  if (!existsSync(path)) {
    console.error('.env.local not found. Create it with VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
  const content = readFileSync(path, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);
const BUCKET = 'acj-media';

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" already exists. Nothing to do.`);
    return;
  }
  const { data, error } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (error) {
    console.error('Failed to create bucket:', error.message);
    process.exit(1);
  }
  console.log(`Bucket "${BUCKET}" created successfully (public).`);
  console.log('Next: run supabase/migrations/20250218000003_storage_policies.sql in the Supabase SQL Editor.');
}

main();
