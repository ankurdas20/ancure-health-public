import { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAdminBlog,
  useCreateBlog,
  useUpdateBlog,
  useCategories,
  useTags,
  generateSlug,
  uploadBlogImage,
} from '@/hooks/useBlogs';
import { useAuth } from '@/contexts/AuthContext';
import { RichTextEditor } from '@/components/blog/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Eye,
  ImagePlus,
  X,
  Loader2,
} from 'lucide-react';

const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(200),
  excerpt: z.string().max(300, 'Excerpt must be 300 characters or less').optional(),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  meta_title: z.string().max(60, 'Meta title should be 60 characters or less').optional(),
  meta_description: z.string().max(160, 'Meta description should be 160 characters or less').optional(),
  tag_ids: z.array(z.string()),
});

type BlogFormData = z.infer<typeof blogSchema>;

const BlogEditor = forwardRef<HTMLDivElement>(function BlogEditor(_, ref) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!id;

  const { data: existingBlog, isLoading: isLoadingBlog } = useAdminBlog(id || '');
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: null,
      category_id: null,
      is_published: false,
      is_featured: false,
      meta_title: '',
      meta_description: '',
      tag_ids: [],
    },
  });

  // Populate form with existing blog data
  useEffect(() => {
    if (existingBlog) {
      form.reset({
        title: existingBlog.title,
        slug: existingBlog.slug,
        excerpt: existingBlog.excerpt || '',
        content: existingBlog.content,
        featured_image: existingBlog.featured_image,
        category_id: existingBlog.category_id,
        is_published: existingBlog.is_published,
        is_featured: existingBlog.is_featured,
        meta_title: existingBlog.meta_title || '',
        meta_description: existingBlog.meta_description || '',
        tag_ids: existingBlog.tagIds || [],
      });
    }
  }, [existingBlog, form]);

  // Auto-generate slug from title
  const watchTitle = form.watch('title');
  useEffect(() => {
    if (!isEditing && watchTitle) {
      const slug = generateSlug(watchTitle);
      form.setValue('slug', slug);
    }
  }, [watchTitle, isEditing, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadBlogImage(file);
      form.setValue('featured_image', url);
      toast({ title: 'Image uploaded successfully!' });
    } catch (error) {
      toast({
        title: 'Failed to upload image',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    if (!user) {
      toast({ title: 'You must be logged in', variant: 'destructive' });
      return;
    }

    try {
      if (isEditing && id) {
        await updateBlog.mutateAsync({ id, data });
      } else {
        await createBlog.mutateAsync({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || '',
          featured_image: data.featured_image || null,
          category_id: data.category_id || null,
          is_published: data.is_published,
          is_featured: data.is_featured,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          tag_ids: data.tag_ids,
          author_id: user.id,
        });
      }
      navigate('/admin/blogs');
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const toggleTag = (tagId: string) => {
    const currentTags = form.getValues('tag_ids');
    if (currentTags.includes(tagId)) {
      form.setValue('tag_ids', currentTags.filter(t => t !== tagId));
    } else {
      form.setValue('tag_ids', [...currentTags, tagId]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You must be logged in to access this page.
          </p>
          <Link to="/auth" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (isEditing && isLoadingBlog) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const featuredImage = form.watch('featured_image');
  const selectedTagIds = form.watch('tag_ids');
  const isPublished = form.watch('is_published');

  return (
    <div ref={ref} className="min-h-screen bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <div className="sticky top-0 z-50 bg-background border-b">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/admin/blogs')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-bold">
                  {isEditing ? 'Edit Post' : 'New Post'}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {isEditing && isPublished && (
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                  >
                    <Link to={`/blogs/${form.getValues('slug')}`} target="_blank">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={createBlog.isPending || updateBlog.isPending}
                >
                  {(createBlog.isPending || updateBlog.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  {isPublished ? 'Publish' : 'Save Draft'}
                </Button>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter post title..."
                          className="text-xl font-semibold h-14"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slug */}
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug *</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-2">/blogs/</span>
                          <Input placeholder="post-slug" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Excerpt */}
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of the post (max 300 characters)..."
                          className="resize-none"
                          maxLength={300}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {(field.value?.length || 0)}/300 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content *</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                          placeholder="Start writing your blog post..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Publish Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="is_published"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel className="font-normal">Published</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel className="font-normal">Featured</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Featured Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {featuredImage ? (
                      <div className="relative">
                        <img
                          src={featuredImage}
                          alt="Featured"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => form.setValue('featured_image', null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          <>
                            <ImagePlus className="h-8 w-8" />
                            <span className="text-sm">Upload Image</span>
                          </>
                        )}
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </CardContent>
                </Card>

                {/* Category */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            value={field.value || ''}
                            onValueChange={(v) => field.onChange(v || null)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tags?.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {(!tags || tags.length === 0) && (
                        <p className="text-sm text-muted-foreground">No tags available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                  <CardHeader>
                    <CardTitle>SEO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="meta_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO title (max 60 chars)"
                              maxLength={60}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {(field.value?.length || 0)}/60
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meta_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="SEO description (max 160 chars)"
                              maxLength={160}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {(field.value?.length || 0)}/160
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
});

export default BlogEditor;
