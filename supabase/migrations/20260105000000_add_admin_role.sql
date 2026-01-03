-- Add a 'role' column to the 'profiles' table to distinguish admins
-- We'll also add a constraint to ensure the role is one of the allowed values.
ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- Create a helper function to get the current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
    'user'
  );
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;


-- Update RLS policy for 'blogs' table to allow admin access
-- This policy allows users with the 'admin' role to do anything on the blogs table.
DROP POLICY IF EXISTS "Allow admin full access to blogs" ON public.blogs;
CREATE POLICY "Allow admin full access to blogs" ON public.blogs
  FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Update RLS policy for 'blog_categories' table
DROP POLICY IF EXISTS "Allow admin write access to blog categories" ON public.blog_categories;
CREATE POLICY "Allow admin write access to blog categories" ON public.blog_categories
  FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');

-- Update RLS policy for 'blog_tags' table
DROP POLICY IF EXISTS "Allow admin write access to blog tags" ON public.blog_tags;
CREATE POLICY "Allow admin write access to blog tags" ON public.blog_tags
  FOR ALL
  USING (public.get_user_role() = 'admin')
  WITH CHECK (public.get_user_role() = 'admin');
