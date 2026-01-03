import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useBlog } from '@/hooks/useBlogs';
import { BlogContent, TableOfContents } from '@/components/blog/BlogContent';
import { RelatedPosts } from '@/components/blog/RelatedPosts';
import { SocialShare } from '@/components/blog/SocialShare';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading, error } = useBlog(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-96 w-full rounded-lg mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blogs"
            className="text-primary hover:underline"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const publishDate = blog.published_at ? new Date(blog.published_at) : new Date(blog.created_at);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const breadcrumbItems = [
    { label: 'Blog', href: '/blogs' },
    ...(blog.category ? [{ label: blog.category.name, href: `/blogs/category/${blog.category.slug}` }] : []),
    { label: blog.title },
  ];

  return (
    <>
      <Helmet>
        <title>{blog.meta_title || blog.title} | Ancure Health</title>
        <meta name="description" content={blog.meta_description || blog.excerpt || ''} />
        <meta property="og:title" content={blog.meta_title || blog.title} />
        <meta property="og:description" content={blog.meta_description || blog.excerpt || ''} />
        {blog.featured_image && <meta property="og:image" content={blog.featured_image} />}
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={publishDate.toISOString()} />
      </Helmet>

      <article className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <header className="mb-8">
            {/* Category & Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.category && (
                <Link to={`/blogs/category/${blog.category.slug}`}>
                  <Badge variant="default">{blog.category.name}</Badge>
                </Link>
              )}
              {blog.tags?.map((tag) => (
                <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Ancure Health Team</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <time dateTime={publishDate.toISOString()}>
                  {format(publishDate, 'MMMM d, yyyy')}
                </time>
              </div>
              {blog.read_time_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{blog.read_time_minutes} min read</span>
                </div>
              )}
            </div>

            {/* Social Share */}
            <SocialShare url={currentUrl} title={blog.title} />
          </header>

          {/* Featured Image */}
          {blog.featured_image && (
            <figure className="mb-8">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </figure>
          )}

          {/* Table of Contents */}
          <TableOfContents content={blog.content} />

          {/* Content */}
          <BlogContent content={blog.content} />

          {/* Bottom Share */}
          <div className="border-t border-b py-6 my-8">
            <SocialShare url={currentUrl} title={blog.title} />
          </div>

          {/* Related Posts */}
          <RelatedPosts currentBlogId={blog.id} categoryId={blog.category_id} />

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link
              to="/blogs"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              ← Back to all articles
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
