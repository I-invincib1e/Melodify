/*
  # Fix handle_new_user trigger function

  ## Problem
  PostgreSQL 17 enforces stricter search_path resolution for SECURITY DEFINER functions.
  Without an explicit SET search_path, the function cannot resolve unqualified table
  references like `profiles` — causing "Database error saving new user" on sign-up.

  ## Changes
  - Recreates handle_new_user() with `SET search_path = public` so `profiles` resolves correctly
  - Uses fully qualified `public.profiles` for clarity
  - Also safely defaults display_name to empty string if both metadata and email are null
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(COALESCE(NEW.email, ''), '@', 1),
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
