import { useRelatedBlogs } from '@/hooks/useBlogs';
import { BlogCard } from './BlogCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedPostsProps {
  currentBlogId: string;
  categoryId: string | null;
}

export function RelatedPosts({ currentBlogId, categoryId }: RelatedPostsProps) {
  const { data: blogs, isLoading } = useRelatedBlogs(currentBlogId, categoryId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Related Posts</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="space-y-6">
      <h3 className="text-2xl font-bold">Related Posts</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
