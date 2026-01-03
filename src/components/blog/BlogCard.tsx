import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { Blog } from '@/hooks/useBlogs';

interface BlogCardProps {
  blog: Blog;
  featured?: boolean;
}

export function BlogCard({ blog, featured = false }: BlogCardProps) {
  const publishDate = blog.published_at ? new Date(blog.published_at) : new Date(blog.created_at);

  return (
    <Link to={`/blogs/${blog.slug}`}>
      <Card className={`h-full overflow-hidden hover:shadow-lg transition-all duration-300 group ${featured ? 'md:flex' : ''}`}>
        {/* Featured Image */}
        <div className={`relative overflow-hidden ${featured ? 'md:w-1/2' : 'h-48'}`}>
          {blog.featured_image ? (
            <img
              src={blog.featured_image}
              alt={blog.title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${featured ? 'h-64 md:h-full' : ''}`}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${featured ? 'h-64 md:h-full' : ''}`}>
              <span className="text-4xl">📝</span>
            </div>
          )}
          {blog.is_featured && (
            <Badge className="absolute top-3 left-3 bg-primary">Featured</Badge>
          )}
        </div>

        <div className={featured ? 'md:w-1/2 flex flex-col' : ''}>
          <CardHeader className="space-y-2">
            {/* Category */}
            {blog.category && (
              <Badge variant="secondary" className="w-fit">
                {blog.category.name}
              </Badge>
            )}

            {/* Title */}
            <h3 className={`font-bold line-clamp-2 group-hover:text-primary transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
              {blog.title}
            </h3>
          </CardHeader>

          <CardContent className="flex-1">
            {/* Excerpt */}
            <p className="text-muted-foreground line-clamp-3">
              {blog.excerpt || blog.content.replace(/<[^>]*>/g, '').slice(0, 150)}
            </p>
          </CardContent>

          <CardFooter className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(publishDate, 'MMM d, yyyy')}</span>
            </div>
            {blog.read_time_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{blog.read_time_minutes} min read</span>
              </div>
            )}
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}
