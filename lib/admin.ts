import { supabase } from './supabase';
import type { Article, ArticleStatus, Journalist, MediaRow, SiteSetting } from './types';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ARTICLE_COLS = 'id, title, slug, excerpt, body, category, author_id, featured_image_url, status, published_at, created_at, updated_at, journalists(name)';

export type ArticleCounts = { published: number; pending: number; draft: number };

export async function fetchAdminArticleCounts(): Promise<ArticleCounts> {
  const [pub, pend, draft] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);
  return {
    published: pub.count ?? 0,
    pending: pend.count ?? 0,
    draft: draft.count ?? 0,
  };
}

export async function fetchLatestPublishedArticle(): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    ...row,
    journalist: (row.journalists as { name?: string } | null) ?? null,
    journalists: undefined,
  } as Article;
}

export async function fetchAdminArticles(limit = 50): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLS)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    journalist: (row.journalists as { name?: string } | null) ?? null,
    journalists: undefined,
  })) as Article[];
}

export async function fetchAdminArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLS)
    .eq('id', id)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return {
    ...row,
    journalist: (row.journalists as { name?: string } | null) ?? null,
    journalists: undefined,
  } as Article;
}

export async function fetchAdminJournalists(): Promise<Journalist[]> {
  const { data, error } = await supabase.from('journalists').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Journalist[];
}

/** Get journalist by email (for current user → role / author_id). */
export async function fetchJournalistByEmail(email: string): Promise<Journalist | null> {
  if (!email?.trim()) return null;
  const { data, error } = await supabase
    .from('journalists')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Journalist | null;
}

/** Create journalist (PostgreSQL only). To let them log in, add a user in Supabase Auth with the same email. */
export async function createJournalist(params: {
  name: string;
  email: string;
  role: string;
  department?: string;
}): Promise<Journalist> {
  const { data, error } = await supabase
    .from('journalists')
    .insert({
      name: params.name.trim(),
      email: params.email.trim(),
      role: params.role.trim(),
      department: params.department?.trim() || null,
      status: 'Active',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Journalist;
}

/** Invite a journalist by email (Vercel serverless endpoint). Requires Editor-in-Chief. */
export async function inviteJournalist(params: {
  name: string;
  email: string;
  role: string;
  department?: string;
}): Promise<{ invited: boolean; journalist: Journalist; message: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetch('/api/invite-journalist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: params.name.trim(),
      email: params.email.trim(),
      role: params.role.trim(),
      department: params.department?.trim() || null,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  return body as { invited: boolean; journalist: Journalist; message: string };
}

export async function upsertJournalist(input: Partial<Journalist> & Pick<Journalist, 'name' | 'role'>): Promise<Journalist> {
  const payload: Record<string, unknown> = {
    id: input.id,
    name: input.name,
    email: input.email ?? null,
    role: input.role,
    department: input.department ?? null,
    bio: input.bio ?? null,
    avatar_url: input.avatar_url ?? null,
    status: input.status ?? 'Active',
    auth_user_id: input.auth_user_id ?? undefined,
  };

  const { data, error } = await supabase.from('journalists').upsert(payload).select('*').single();
  if (error) throw error;
  return data as Journalist;
}

export async function upsertArticle(input: Partial<Article> & Pick<Article, 'title' | 'category'>): Promise<Article> {
  const nowIso = new Date().toISOString();
  const payload: Record<string, unknown> = {
    id: input.id,
    title: input.title,
    slug: input.slug ?? slugify(input.title),
    excerpt: input.excerpt ?? null,
    body: input.body ?? null,
    category: input.category,
    author_id: input.author_id ?? null,
    featured_image_url: input.featured_image_url ?? null,
    status: input.status ?? 'draft',
    published_at: input.status === 'published' ? (input.published_at ?? nowIso) : input.published_at ?? null,
  };

  const { data, error } = await supabase.from('articles').upsert(payload).select(ARTICLE_COLS).single();
  if (error) throw error;
  const row = data as Record<string, unknown>;
  return {
    ...row,
    journalist: (row.journalists as { name?: string } | null) ?? null,
    journalists: undefined,
  } as Article;
}

export async function setArticleStatus(articleId: string, status: ArticleStatus): Promise<void> {
  const payload: Record<string, unknown> = {
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
  };
  const { error } = await supabase.from('articles').update(payload).eq('id', articleId);
  if (error) throw error;
}

/** Update only the provided article fields (for quick edits). Omit undefined. */
export async function updateArticle(
  articleId: string,
  patch: Partial<Pick<Article, 'title' | 'slug' | 'excerpt' | 'body' | 'category' | 'featured_image_url' | 'status' | 'author_id'>>
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    payload.title = patch.title;
    payload.slug = patch.slug ?? slugify(patch.title);
  }
  if (patch.slug !== undefined) payload.slug = patch.slug;
  if (patch.excerpt !== undefined) payload.excerpt = patch.excerpt;
  if (patch.body !== undefined) payload.body = patch.body;
  if (patch.category !== undefined) payload.category = patch.category;
  if (patch.featured_image_url !== undefined) payload.featured_image_url = patch.featured_image_url;
  if (patch.status !== undefined) {
    payload.status = patch.status;
    payload.published_at = patch.status === 'published' ? new Date().toISOString() : null;
  }
  if (patch.author_id !== undefined) payload.author_id = patch.author_id;
  if (Object.keys(payload).length === 0) return;
  const { error } = await supabase.from('articles').update(payload).eq('id', articleId);
  if (error) throw error;
}

export async function fetchMedia(limit = 100): Promise<MediaRow[]> {
  const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as MediaRow[];
}

export async function insertMediaRow(input: Omit<MediaRow, 'id' | 'created_at'>): Promise<MediaRow> {
  const { data, error } = await supabase.from('media').insert(input).select('*').single();
  if (error) throw error;
  return data as MediaRow;
}

export async function fetchContactsCount(): Promise<number> {
  const { count, error } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function fetchJournalistsCount(): Promise<number> {
  const { count, error } = await supabase.from('journalists').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function fetchSiteSetting(key: string): Promise<SiteSetting | null> {
  const { data, error } = await supabase.from('site_settings').select('*').eq('key', key).maybeSingle();
  if (error) throw error;
  return (data ?? null) as SiteSetting | null;
}

export async function upsertSiteSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase.from('site_settings').upsert({ key, value });
  if (error) throw error;
}

