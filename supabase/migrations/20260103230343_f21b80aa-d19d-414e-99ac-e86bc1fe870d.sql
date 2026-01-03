-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Update blog RLS policies to require admin role
DROP POLICY IF EXISTS "Authors can create blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can update their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can delete their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can view their own blogs" ON public.blogs;

-- New admin-only policies for blogs
CREATE POLICY "Admins can create blogs"
ON public.blogs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blogs"
ON public.blogs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blogs"
ON public.blogs
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all blogs"
ON public.blogs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update category RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.blog_categories;

CREATE POLICY "Admins can manage categories"
ON public.blog_categories
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update tag RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage tags" ON public.blog_tags;

CREATE POLICY "Admins can manage tags"
ON public.blog_tags
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update tag relations RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage tag relations" ON public.blog_tag_relations;

CREATE POLICY "Admins can manage tag relations"
ON public.blog_tag_relations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));