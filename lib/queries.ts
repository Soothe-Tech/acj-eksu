import { supabase } from './supabase';
import type { Article, ContactSubmission, Journalist } from './types';

const ARTICLE_COLS = 'id, title, slug, excerpt, body, category, author_id, featured_image_url, status, published_at, created_at, updated_at, journalists(name)';

export async function fetchPublishedArticles(limit = 20): Promise<Article[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLS)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...row,
    journalist: (row.journalists as { name?: string } | null) ?? null,
    journalists: undefined,
  })) as Article[];
}

export async function fetchArticleById(id: string): Promise<Article | null> {
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

export async function fetchPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(ARTICLE_COLS)
    .eq('slug', slug)
    .eq('status', 'published')
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

export async function fetchJournalists(): Promise<Journalist[]> {
  const { data, error } = await supabase
    .from('journalists')
    .select('*')
    .eq('status', 'Active')
    .order('name');
  if (error) throw error;
  return (data ?? []) as Journalist[];
}

export function formatArticleTime(publishedAt: string | null): string {
  if (!publishedAt) return '';
  const d = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return d.toLocaleDateString();
}

export function articleLabelColor(category: string): string {
  const map: Record<string, string> = {
    'Campus News': 'bg-primary text-white',
    'Interview': 'bg-purple-600 text-white',
    'Sports': 'bg-green-600 text-white',
    'Politics': 'bg-yellow-600 text-white',
    'Academics': 'bg-blue-500 text-white',
    'Lifestyle': 'bg-pink-600 text-white',
  };
  return map[category] ?? 'bg-slate-800 text-white';
}

export async function submitContact(form: ContactSubmission): Promise<void> {
  const { error } = await supabase.from('contacts').insert(form);
  if (error) throw error;
}
