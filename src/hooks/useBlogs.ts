import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  category_id: string | null;
  author_id: string;
  is_published: boolean;
  is_featured: boolean;
  read_time_minutes: number | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  meta_title: string;
  meta_description: string;
  tag_ids: string[];
}

// Fetch all published blogs with optional filters
export function usePublishedBlogs(options?: {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ['blogs', 'published', options],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          category:blog_categories(*)
        `, { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (options?.categorySlug) {
        const { data: category } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', options.categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        blogs: data as Blog[],
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        currentPage: page,
      };
    },
  });
}

// Fetch single blog by slug
export function useBlog(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Blog not found');

      // Fetch tags for this blog
      const { data: tagRelations } = await supabase
        .from('blog_tag_relations')
        .select('tag_id')
        .eq('blog_id', data.id);

      if (tagRelations && tagRelations.length > 0) {
        const tagIds = tagRelations.map(r => r.tag_id);
        const { data: tags } = await supabase
          .from('blog_tags')
          .select('*')
          .in('id', tagIds);
        
        return { ...data, tags } as Blog;
      }

      return data as Blog;
    },
    enabled: !!slug,
  });
}

// Fetch all blogs for admin (including drafts)
export function useAdminBlogs(options?: {
  status?: 'all' | 'published' | 'draft';
  categoryId?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['blogs', 'admin', options],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .order('updated_at', { ascending: false });

      if (options?.status === 'published') {
        query = query.eq('is_published', true);
      } else if (options?.status === 'draft') {
        query = query.eq('is_published', false);
      }

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as Blog[];
    },
  });
}

// Fetch single blog by ID for editing
export function useAdminBlog(id: string) {
  return useQuery({
    queryKey: ['blog', 'admin', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          category:blog_categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const { data: tagRelations } = await supabase
        .from('blog_tag_relations')
        .select('tag_id')
        .eq('blog_id', data.id);

      const tagIds = tagRelations?.map(r => r.tag_id) ?? [];

      return { ...data, tagIds } as Blog & { tagIds: string[] };
    },
    enabled: !!id,
  });
}

// Fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogCategory[];
    },
  });
}

// Fetch all tags
export function useTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as BlogTag[];
    },
  });
}

// Fetch related blogs
export function useRelatedBlogs(currentBlogId: string, categoryId: string | null) {
  return useQuery({
    queryKey: ['blogs', 'related', currentBlogId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from('blogs')
        .select(`*, category:blog_categories(*)`)
        .eq('is_published', true)
        .neq('id', currentBlogId)
        .limit(3);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('published_at', { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
    enabled: !!currentBlogId,
  });
}

const getFullBlog = async (id: string): Promise<Blog> => {
    const { data, error } = await supabase
        .from('blogs')
        .select(`*, category:blog_categories(*)`)
        .eq('id', id)
        .single();
    if (error) throw error;
    return data as Blog;
}

// Create blog mutation
export function useCreateBlog(options?: { onSuccess?: (data: Blog) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BlogFormData & { author_id: string }) => {
      const { tag_ids, ...blogData } = data;
      
      const wordCount = blogData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      const read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));

      const { data: blog, error } = await supabase
        .from('blogs')
        .insert({
          ...blogData,
          read_time_minutes,
          published_at: blogData.is_published ? new Date().toISOString() : null,
        })
        .select('id')
        .single();

      if (error) throw error;

      if (tag_ids.length > 0) {
        const tagRelations = tag_ids.map(tag_id => ({ blog_id: blog.id, tag_id }));
        await supabase.from('blog_tag_relations').insert(tagRelations);
      }
      
      return await getFullBlog(blog.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({ title: 'Blog created successfully!' });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating blog', description: error.message, variant: 'destructive' });
    },
  });
}

// Update blog mutation
export function useUpdateBlog(options?: { onSuccess?: (data: Blog) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BlogFormData> }) => {
      const { tag_ids, ...blogData } = data;

      if (blogData.content) {
        const wordCount = blogData.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        (blogData as any).read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));
      }

      if (data.is_published === true) {
        const { data: currentBlog } = await supabase.from('blogs').select('is_published').eq('id', id).single();
        if (currentBlog && !currentBlog.is_published) {
          (blogData as any).published_at = new Date().toISOString();
        }
      } else if (data.is_published === false) {
        (blogData as any).published_at = null;
      }

      const { data: blog, error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', id)
        .select('id')
        .single();

      if (error) throw error;

      if (tag_ids !== undefined) {
        await supabase.from('blog_tag_relations').delete().eq('blog_id', id);
        if (tag_ids.length > 0) {
          const tagRelations = tag_ids.map(tag_id => ({ blog_id: id, tag_id }));
          await supabase.from('blog_tag_relations').insert(tagRelations);
        }
      }
      
      return await getFullBlog(blog.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['blog', 'admin', data.id] });
      toast({ title: 'Blog updated successfully!' });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating blog', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete blog mutation
export function useDeleteBlog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('blog_tag_relations').delete().eq('blog_id', id);
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({ title: 'Blog deleted successfully!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting blog', description: error.message, variant: 'destructive' });
    },
  });
}

// Upload image to storage
export async function uploadBlogImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
