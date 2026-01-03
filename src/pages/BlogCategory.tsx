import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublishedBlogs, useCategories } from '@/hooks/useBlogs';
import { BlogCard } from '@/components/blog/BlogCard';
import { Breadcrumb } from '@/components/blog/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';

export default function BlogCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: categories } = useCategories();
  const category = categories?.find(c => c.slug === slug);

  const { data, isLoading } = usePublishedBlogs({
    categorySlug: slug,
    page,
    limit: 10,
  });

  const breadcrumbItems = [
    { label: 'Blog', href: '/blogs' },
    { label: category?.name || 'Category' },
  ];

  if (!category && !isLoading && categories) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The category you're looking for doesn't exist.
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

  return (
    <>
      <Helmet>
        <title>{category?.name || 'Category'} | Ancure Health Blog</title>
        <meta 
          name="description" 
          content={category?.description || `Browse all ${category?.name} articles on Ancure Health.`} 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
          <div className="container mx-auto px-4">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center gap-3 mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {category?.name || 'Category'}
              </h1>
            </div>
            {category?.description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category.description}
              </p>
            )}
            {data && (
              <p className="text-sm text-muted-foreground mt-4">
                {data.total} article{data.total !== 1 ? 's' : ''} in this category
              </p>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
            </div>
          ) : data?.blogs && data.blogs.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {data.blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
              <p className="text-muted-foreground">
                Check back soon for new articles in this category!
              </p>
              <Link
                to="/blogs"
                className="text-primary hover:underline inline-block mt-4"
              >
                ← Browse all articles
              </Link>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
