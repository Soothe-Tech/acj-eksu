-- Create a journalist from SQL (run in Supabase SQL Editor).
-- After running, create the login user in Authentication → Users with the SAME email.

CREATE OR REPLACE FUNCTION create_journalist(
  p_name text,
  p_email text,
  p_role text DEFAULT 'Contributor',
  p_department text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO journalists (name, email, role, department, status)
  VALUES (trim(p_name), trim(p_email), trim(p_role), nullif(trim(p_department), ''), 'Active')
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

COMMENT ON FUNCTION create_journalist(text, text, text, text) IS
  'Inserts a journalist. Then add a user in Authentication → Users with the same email so they can log in.';
