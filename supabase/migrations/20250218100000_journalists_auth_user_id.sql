-- Link journalists to Supabase Auth so they can log in
ALTER TABLE journalists
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_journalists_auth_user_id ON journalists(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_journalists_email ON journalists(email);

COMMENT ON COLUMN journalists.auth_user_id IS 'Links to Supabase Auth user; set when journalist is created with login.';
