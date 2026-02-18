#!/usr/bin/env node
/**
 * Create a Supabase Auth user and a journalist record so they can log in and post.
 * Run: node scripts/create-journalist-user.mjs "Name" "email@example.com" "Editor in Chief" "Password123" "Faculty of Arts"
 * Or set env: JOURNALIST_NAME, JOURNALIST_EMAIL, JOURNALIST_ROLE, JOURNALIST_PASSWORD, JOURNALIST_DEPARTMENT
 *
 * Requires: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
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
    console.error('.env.local not found.');
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
const name = process.env.JOURNALIST_NAME || process.argv[2];
const email = process.env.JOURNALIST_EMAIL || process.argv[3];
const role = process.env.JOURNALIST_ROLE || process.argv[4] || 'Contributor';
const password = process.env.JOURNALIST_PASSWORD || process.argv[5];
const department = process.env.JOURNALIST_DEPARTMENT || process.argv[6] || null;

if (!url || !serviceRoleKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
if (!name || !email || !password) {
  console.error('Usage: node scripts/create-journalist-user.mjs "Full Name" "email@example.com" "Editor in Chief" "Password123" "Department"');
  process.exit(1);
}

const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const { data: userData, error: authError } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
  });
  if (authError) {
    console.error('Auth error:', authError.message);
    process.exit(1);
  }
  const authUserId = userData.user?.id;
  if (!authUserId) {
    console.error('No user id returned');
    process.exit(1);
  }

  const { data: journalist, error: dbError } = await admin
    .from('journalists')
    .insert({
      auth_user_id: authUserId,
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department: department?.trim() || null,
      status: 'Active',
    })
    .select('*')
    .single();

  if (dbError) {
    await admin.auth.admin.deleteUser(authUserId);
    console.error('Database error:', dbError.message);
    process.exit(1);
  }

  console.log('Journalist created. They can log in at /admin/login with:', email.trim());
}

main();
