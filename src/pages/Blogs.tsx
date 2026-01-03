import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublishedBlogs, useCategories } from '@/hooks/useBlogs';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export default function Blogs() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categorySlug, setCategorySlug] = useState<string | undefined>(
    searchParams.get('category') || undefined
  );
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePublishedBlogs({
    search,
    categorySlug,
    page,
    limit: 10,
  });

  const { data: featuredData } = usePublishedBlogs({
    featured: true,
    limit: 1,
  });

  const featuredBlog = featuredData?.blogs?.[0];

  return (
    <>
      <Helmet>
        <title>Medical Blog | Ancure Health</title>
        <meta name="description" content="Explore our medical blog for expert health insights, tips, and the latest in healthcare information." />
        <meta property="og:title" content="Medical Blog | Ancure Health" />
        <meta property="og:description" content="Explore our medical blog for expert health insights, tips, and the latest in healthcare information." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">Blog</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                Health & Wellness Blog
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Expert insights, health tips, and the latest in medical research to help you live your healthiest life.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          {/* Featured Post */}
          {featuredBlog && !search && !categorySlug && page === 1 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Featured Article</h2>
              <BlogCard blog={featuredBlog} featured />
            </section>
          )}

          {/* Filters */}
          <section className="mb-8">
            <BlogFilters
              onSearch={setSearch}
              onCategoryChange={setCategorySlug}
              selectedCategory={categorySlug}
            />
          </section>

          {/* Blog Grid */}
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
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {search || categorySlug
                  ? 'Try adjusting your filters or search terms.'
                  : 'Check back soon for new articles!'}
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
