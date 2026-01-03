-- Create blog categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT blog_categories_pkey PRIMARY KEY (id),
    CONSTRAINT blog_categories_slug_key UNIQUE (slug)
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to blog categories" ON public.blog_categories;
CREATE POLICY "Allow public read access to blog categories" ON public.blog_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to blog categories" ON public.blog_categories;
CREATE POLICY "Allow admin write access to blog categories" ON public.blog_categories FOR ALL USING (auth.role() = 'service_role'::text);


-- Create blog tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name character varying NOT NULL,
    slug character varying NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT blog_tags_pkey PRIMARY KEY (id),
    CONSTRAINT blog_tags_slug_key UNIQUE (slug)
);
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to blog tags" ON public.blog_tags;
CREATE POLICY "Allow public read access to blog tags" ON public.blog_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to blog tags" ON public.blog_tags;
CREATE POLICY "Allow admin write access to blog tags" ON public.blog_tags FOR ALL USING (auth.role() = 'service_role'::text);


-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title character varying NOT NULL,
    slug character varying NOT NULL,
    content text NOT NULL,
    excerpt text,
    featured_image text,
    category_id uuid,
    author_id uuid NOT NULL,
    is_published boolean NOT NULL DEFAULT false,
    is_featured boolean NOT NULL DEFAULT false,
    read_time_minutes integer,
    meta_title character varying,
    meta_description character varying,
    published_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT blogs_pkey PRIMARY KEY (id),
    CONSTRAINT blogs_slug_key UNIQUE (slug),
    CONSTRAINT blogs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to published blogs" ON public.blogs;
CREATE POLICY "Allow public read access to published blogs" ON public.blogs FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS "Allow admin full access to blogs" ON public.blogs;
CREATE POLICY "Allow admin full access to blogs" ON public.blogs FOR ALL USING (auth.role() = 'service_role'::text);


-- Create blog_tag_relations table
CREATE TABLE IF NOT EXISTS public.blog_tag_relations (
    blog_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    CONSTRAINT blog_tag_relations_pkey PRIMARY KEY (blog_id, tag_id),
    CONSTRAINT blog_tag_relations_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id) ON DELETE CASCADE,
    CONSTRAINT blog_tag_relations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.blog_tags(id) ON DELETE CASCADE
);
ALTER TABLE public.blog_tag_relations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to blog tag relations" ON public.blog_tag_relations;
CREATE POLICY "Allow public read access to blog tag relations" ON public.blog_tag_relations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow admin write access to blog tag relations" ON public.blog_tag_relations;
CREATE POLICY "Allow admin write access to blog tag relations" ON public.blog_tag_relations FOR ALL USING (auth.role() = 'service_role'::text);


-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read access to blog images" ON storage.objects;
CREATE POLICY "Allow public read access to blog images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-images' );

DROP POLICY IF EXISTS "Allow authenticated users to upload blog images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload blog images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'blog-images' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Allow authenticated users to update their own blog images" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own blog images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'blog-images' AND auth.uid() = owner );

DROP POLICY IF EXISTS "Allow authenticated users to delete their own blog images" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own blog images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'blog-images' AND auth.uid() = owner );

-- Realtime
-- alter publication supabase_realtime add table public.blogs;
-- alter publication supabase_realtime add table public.blog_categories;
-- alter publication supabase_realtime add table public.blog_tags;
-- alter publication supabase_realtime add table public.blog_tag_relations;

-- Search
create extension if not exists pg_trgm;

-- Function to handle blog updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_blog_update ON public.blogs;
CREATE TRIGGER on_blog_update
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
