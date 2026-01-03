
set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_role() RETURNS text
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()),
    'user'
  );
$$;

GRANT ALL ON FUNCTION public.get_user_role() TO anon;
GRANT ALL ON FUNCTION public.get_user_role() TO authenticated;
GRANT ALL ON FUNCTION public.get_user_role() TO service_role;


CREATE TABLE public.blog_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.blog_categories OWNER TO postgres;

CREATE TABLE public.blog_tag_relations (
    blog_id uuid NOT NULL,
    tag_id uuid NOT NULL
);

ALTER TABLE public.blog_tag_relations OWNER TO postgres;

CREATE TABLE public.blog_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    slug character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.blog_tags OWNER TO postgres;

CREATE TABLE public.blogs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    slug character varying NOT NULL,
    content text NOT NULL,
    excerpt text,
    featured_image text,
    category_id uuid,
    author_id uuid NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    read_time_minutes integer,
    meta_title character varying,
    meta_description character varying,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.blogs OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_updated_at() OWNER TO postgres;

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email character varying,
    full_name character varying,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_number character varying,
    role text DEFAULT 'user'::text,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);

ALTER TABLE public.profiles OWNER TO postgres;

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.blog_tag_relations
    ADD CONSTRAINT blog_tag_relations_pkey PRIMARY KEY (blog_id, tag_id);

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.blog_tags
    ADD CONSTRAINT blog_tags_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_slug_key UNIQUE (slug);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_email_key UNIQUE (email);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

CREATE TRIGGER on_blog_update BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE ONLY public.blog_tag_relations
    ADD CONSTRAINT blog_tag_relations_blog_id_fkey FOREIGN KEY (blog_id) REFERENCES public.blogs(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.blog_tag_relations
    ADD CONSTRAINT blog_tag_relations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.blog_tags(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE POLICY "Allow admin full access to blogs" ON public.blogs FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

CREATE POLICY "Allow admin write access to blog categories" ON public.blog_categories FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

CREATE POLICY "Allow admin write access to blog tag relations" ON public.blog_tag_relations FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

CREATE POLICY "Allow admin write access to blog tags" ON public.blog_tags FOR ALL USING ((get_user_role() = 'admin'::text)) WITH CHECK ((get_user_role() = 'admin'::text));

CREATE POLICY "Allow authenticated users to delete their own blog images" ON storage.objects FOR DELETE USING (((bucket_id = 'blog-images'::text) AND (auth.uid() = owner)));

CREATE POLICY "Allow authenticated users to upload blog images" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'blog-images'::text) AND (auth.role() = 'authenticated'::text)));

CREATE POLICY "Allow authenticated users to update their own blog images" ON storage.objects FOR UPDATE USING (((bucket_id = 'blog-images'::text) AND (auth.uid() = owner)));

CREATE POLICY "Allow individuals to update their own profile." ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));

CREATE POLICY "Allow public read access to blog categories" ON public.blog_categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access to blog images" ON storage.objects FOR SELECT USING ((bucket_id = 'blog-images'::text));

CREATE POLICY "Allow public read access to blog tag relations" ON public.blog_tag_relations FOR SELECT USING (true);

CREATE POLICY "Allow public read access to blog tags" ON public.blog_tags FOR SELECT USING (true);

CREATE POLICY "Allow public read access to published blogs" ON public.blogs FOR SELECT USING ((is_published = true));

CREATE POLICY "Allow users to read their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));

CREATE POLICY "Enable read access for all users" ON public.blogs FOR SELECT USING (true);

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.blog_tag_relations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.blog_categories TO anon;
GRANT ALL ON TABLE public.blog_categories TO authenticated;
GRANT ALL ON TABLE public.blog_categories TO service_role;

GRANT ALL ON TABLE public.blog_tag_relations TO anon;
GRANT ALL ON TABLE public.blog_tag_relations TO authenticated;
GRANT ALL ON TABLE public.blog_tag_relations TO service_role;

GRANT ALL ON TABLE public.blog_tags TO anon;
GRANT ALL ON TABLE public.blog_tags TO authenticated;
GRANT ALL ON TABLE public.blog_tags TO service_role;

GRANT ALL ON TABLE public.blogs TO anon;
GRANT ALL ON TABLE public.blogs TO authenticated;
GRANT ALL ON TABLE public.blogs TO service_role;

GRANT ALL ON FUNCTION public.handle_updated_at() TO anon;
GRANT ALL ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.handle_updated_at() TO service_role;

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_categories;

ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_tag_relations;

ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_tags;

ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;

