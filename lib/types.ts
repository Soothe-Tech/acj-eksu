// Database entity types (match Supabase schema)

export type ArticleStatus = 'draft' | 'pending' | 'published';
export type JournalistStatus = 'Active' | 'On Leave' | 'Inactive';

export interface Article {
  id: string;
  title: string;
  slug: string | null;
  excerpt: string | null;
  body: string | null;
  category: string;
  author_id: string | null;
  featured_image_url: string | null;
  status: ArticleStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  journalist?: { name: string } | null;
}

export interface Journalist {
  id: string;
  name: string;
  email: string | null;
  role: string;
  department: string | null;
  bio: string | null;
  avatar_url: string | null;
  status: JournalistStatus;
  auth_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaRow {
  id: string;
  name: string;
  type: string;
  size_bytes: number | null;
  storage_path: string;
  bucket_name: string;
  public_url: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface ContactSubmission {
  full_name: string;
  email: string;
  subject_type: string;
  message: string;
}

export interface SiteSetting {
  key: string;
  value: unknown;
  updated_at: string;
}
