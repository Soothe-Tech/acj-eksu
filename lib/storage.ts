import { supabase } from './supabase';

const BUCKET = 'acj-media';

export type UploadOptions = {
  folder?: string;
  fileName?: string;
};

/** Normalize Supabase/Storage error to something with .message */
function toError(err: unknown): { message: string } {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return { message: (err as { message: string }).message };
  }
  return { message: err instanceof Error ? err.message : String(err) };
}

/**
 * Upload a file to Supabase Storage (acj-media bucket).
 * Returns the public URL for the uploaded file.
 * Ensure the bucket "acj-media" exists in Supabase (Storage → New bucket, Public: on) and run storage policies migration.
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<{ path: string; publicUrl: string; error: { message: string } | null }> {
  const folder = options.folder ?? 'uploads';
  const fileName = options.fileName ?? `${Date.now()}-${file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const path = `${folder}/${fileName}`;

  try {
    const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) {
      return { path: '', publicUrl: '', error: toError(error) };
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    return { path: data.path, publicUrl: urlData.publicUrl, error: null };
  } catch (e) {
    return { path: '', publicUrl: '', error: toError(e) };
  }
}

/**
 * Get public URL for a path in the bucket (if you already have the path stored).
 */
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export { BUCKET };
