import { useMemo } from 'react';

interface BlogContentProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function BlogContent({ content }: BlogContentProps) {
  return (
    <div 
      className="prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-foreground
        prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
        prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
        prose-p:text-foreground/90 prose-p:leading-relaxed
        prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
        prose-strong:text-foreground prose-strong:font-semibold
        prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
        prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-ul:list-disc prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-foreground/90
        prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
        prose-hr:border-border
      "
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export function TableOfContents({ content }: { content: string }) {
  const toc = useMemo(() => {
    const headingRegex = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      items.push({ id, text, level });
    }

    return items;
  }, [content]);

  if (toc.length < 3) return null;

  return (
    <nav className="bg-muted/50 rounded-lg p-4 mb-8">
      <h4 className="font-semibold mb-3 text-foreground">Table of Contents</h4>
      <ul className="space-y-2">
        {toc.map((item, index) => (
          <li
            key={index}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className="text-muted-foreground hover:text-primary transition-colors text-sm"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
