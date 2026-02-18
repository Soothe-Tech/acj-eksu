-- =============================================================================
-- COPY-PASTE THIS IN SUPABASE SQL EDITOR (Browser)
-- =============================================================================
-- 1. Run the block below ONCE to create the function.
-- 2. To add a journalist: edit the SELECT line with name, email, role, department
--    and run it. Then create a user in Authentication → Users with the SAME email.
-- =============================================================================

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

-- Example: add a journalist (edit values and run)
-- SELECT create_journalist('Full Name', 'email@example.com', 'Editor in Chief', 'Department');
-- Then: Authentication → Users → Add user → same email + password.
