import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { useCategories } from '@/hooks/useBlogs';

interface BlogFiltersProps {
  onSearch: (search: string) => void;
  onCategoryChange: (category: string | undefined) => void;
  selectedCategory?: string;
}

export function BlogFilters({ onSearch, onCategoryChange, selectedCategory }: BlogFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const { data: categories } = useCategories();

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
      if (searchValue) {
        searchParams.set('search', searchValue);
      } else {
        searchParams.delete('search');
      }
      setSearchParams(searchParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleCategoryClick = (categorySlug: string) => {
    if (selectedCategory === categorySlug) {
      onCategoryChange(undefined);
      searchParams.delete('category');
    } else {
      onCategoryChange(categorySlug);
      searchParams.set('category', categorySlug);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchValue('');
    onSearch('');
    onCategoryChange(undefined);
    setSearchParams({});
  };

  const hasFilters = searchValue || selectedCategory;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10"
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchValue('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.slug ? 'default' : 'outline'}
            className="cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => handleCategoryClick(category.slug)}
          >
            {category.name}
          </Badge>
        ))}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6">
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
