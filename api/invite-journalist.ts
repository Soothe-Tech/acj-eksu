import { createClient } from '@supabase/supabase-js';

function json(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function getEnv(name: string): string | undefined {
  return process.env[name];
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = getEnv('SUPABASE_URL') ?? getEnv('VITE_SUPABASE_URL');
  const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') ?? getEnv('VITE_SUPABASE_ANON_KEY');
  const supabaseServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    json(res, 500, { error: 'Server is missing SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY' });
    return;
  }

  const authHeader = req.headers?.authorization ?? req.headers?.Authorization;
  const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;
  if (!token) {
    json(res, 401, { error: 'Missing Authorization: Bearer <token>' });
    return;
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    json(res, 401, { error: 'Invalid session' });
    return;
  }

  const callerEmail = userData.user.email ?? null;
  const callerId = userData.user.id;
  if (!callerEmail) {
    json(res, 400, { error: 'Caller has no email' });
    return;
  }

  const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Authorize: only Editor in Chief can invite
  const { data: byAuthId } = await admin
    .from('journalists')
    .select('id, role, email, auth_user_id')
    .eq('auth_user_id', callerId)
    .maybeSingle();
  const { data: byEmail } = byAuthId
    ? { data: null }
    : await admin
        .from('journalists')
        .select('id, role, email, auth_user_id')
        .ilike('email', callerEmail)
        .maybeSingle();
  const callerJournalist = (byAuthId ?? byEmail) as any;

  const callerRole = (callerJournalist as any)?.role as string | undefined;
  const isEic = !!callerRole && (callerRole === 'Editor in Chief' || callerRole === 'Editor-in-Chief');
  if (!isEic) {
    json(res, 403, { error: 'Only Editor in Chief can invite journalists' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
  const name = (body?.name ?? '').toString().trim();
  const email = (body?.email ?? '').toString().trim();
  const role = (body?.role ?? 'Contributor').toString().trim();
  const department = (body?.department ?? '').toString().trim();
  const redirectTo = (body?.redirectTo ?? '').toString().trim();

  if (!name || !email) {
    json(res, 400, { error: 'Missing name or email' });
    return;
  }

  // Build redirect URL for the invite email. Never use localhost in production.
  const isLocalhost = (u: string) => /^https?:\/\/localhost(:\d+)?(\/|$)/i.test(u) || u.startsWith('http://127.0.0.1');
  const pickRedirect = (...candidates: (string | undefined)[]): string | undefined => {
    for (const c of candidates) {
      const u = (c ?? '').toString().trim();
      if (u && !isLocalhost(u)) return u;
    }
    return undefined;
  };
  const baseUrl = pickRedirect(
    getEnv('INVITE_REDIRECT_TO'),      // e.g. https://acj.soothetechnologies.com/admin/login
    getEnv('SITE_URL'),                // e.g. https://acj.soothetechnologies.com
    redirectTo,
    (req.headers?.origin ?? '').toString().trim(),
    getEnv('VERCEL_URL') ? `https://${getEnv('VERCEL_URL')}` : ''
  );
  const safeRedirectTo = baseUrl
    ? (baseUrl.includes('/admin') ? baseUrl.replace(/\/$/, '') : `${baseUrl.replace(/\/$/, '')}/admin/login`)
    : undefined;

  // Invite (send email). If user already exists, we link instead.
  let authUserId: string | null = null;
  let invited = false;

  const inviteRes = await admin.auth.admin.inviteUserByEmail(
    email,
    safeRedirectTo ? { redirectTo: safeRedirectTo } : undefined
  );
  if (inviteRes.error) {
    // User may already exist (e.g. "User already registered"). Still upsert journalist
    // with auth_user_id null; they can sign in with that email and be linked later.
    authUserId = null;
    invited = false;
    // Don't return here — fall through to upsert journalist and return friendly message
  } else {
    authUserId = inviteRes.data.user?.id ?? null;
    invited = true;
  }

  // Upsert journalist by email (treat email as unique for the UI flow)
  const { data: existingJournalist } = await admin
    .from('journalists')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    name,
    email,
    role,
    department: department || null,
    status: 'Active',
    auth_user_id: authUserId,
  };

  const upserted = existingJournalist?.id
    ? await admin.from('journalists').update(payload).eq('id', existingJournalist.id).select('*').single()
    : await admin.from('journalists').insert(payload).select('*').single();

  if (upserted.error) {
    json(res, 400, { error: upserted.error.message });
    return;
  }

  json(res, 200, {
    invited,
    journalist: upserted.data,
    message: invited ? 'Invite email sent' : 'User already registered; journalist record updated. They can sign in with that email.',
  });
}

