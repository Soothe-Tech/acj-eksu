-- Delete a user at all levels by email.
-- Run in Supabase SQL Editor (Dashboard → SQL Editor). Replace the email below.
-- If DELETE from auth.users fails (permission), run the "clear links" block only
--   then remove the user manually in Authentication → Users.

-- Option A: One-off run (change the email and execute)
DO $$
DECLARE
  target_email TEXT := 'user@example.com';  -- <-- CHANGE THIS
  auth_id UUID;
BEGIN
  SELECT id INTO auth_id FROM auth.users WHERE LOWER(email) = LOWER(target_email) LIMIT 1;

  IF auth_id IS NULL THEN
    RAISE NOTICE 'No auth user found with email: %', target_email;
    RETURN;
  END IF;

  UPDATE public.journalists SET auth_user_id = NULL WHERE auth_user_id = auth_id;
  UPDATE public.media SET uploaded_by = NULL WHERE uploaded_by = auth_id;
  DELETE FROM public.profiles WHERE id = auth_id;
  DELETE FROM auth.users WHERE id = auth_id;

  RAISE NOTICE 'Deleted user and cleared links for: %', target_email;
END $$;

-- Option B: Reusable function (create once, then call with any email)
-- CREATE OR REPLACE FUNCTION delete_user_by_email(target_email TEXT)
-- RETURNS TEXT
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- DECLARE
--   auth_id UUID;
-- BEGIN
--   SELECT id INTO auth_id FROM auth.users WHERE LOWER(email) = LOWER(target_email) LIMIT 1;
--   IF auth_id IS NULL THEN
--     RETURN 'No user found with email: ' || target_email;
--   END IF;
--   UPDATE public.journalists SET auth_user_id = NULL WHERE auth_user_id = auth_id;
--   UPDATE public.media SET uploaded_by = NULL WHERE uploaded_by = auth_id;
--   DELETE FROM public.profiles WHERE id = auth_id;
--   DELETE FROM auth.users WHERE id = auth_id;
--   RETURN 'Deleted and cleared links for: ' || target_email;
-- END $$;
--
-- Then run: SELECT delete_user_by_email('someone@example.com');
