import { supabase } from './supabase';

const BUCKET = 'acj-media';

export type UploadOptions = {
  folder?: string;
  fileName?: string;
};

/**
 * Upload a file to Supabase Storage (acj-media bucket).
 * Returns the public URL for the uploaded file.
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<{ path: string; publicUrl: string; error: Error | null }> {
  const folder = options.folder ?? 'uploads';
  const fileName = options.fileName ?? `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const path = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    return { path: '', publicUrl: '', error };
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return { path: data.path, publicUrl: urlData.publicUrl, error: null };
}

/**
 * Get public URL for a path in the bucket (if you already have the path stored).
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export { BUCKET };
