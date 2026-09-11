import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';


interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  tags: string[];
  viewCount: number;
  publishedAt: string;
}

export default function Blog() {
  const { data: posts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    queryFn: async () => {
      const response = await fetch('/api/blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    }
  });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Blog</h1>
          <p className="text-gray-600">Failed to load blog posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--paper)' }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: 'var(--paper)', borderBottomColor: 'var(--line)' }} className="text-foreground border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              LingoMitra Blog
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: 'var(--text-light)' }}>
              Discover language learning tips, cultural insights, and ideas for thoughtful practice.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Section */}
      <div className="flex-1 container mx-auto px-4 py-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border" style={{ backgroundColor: 'var(--studio-surface)', borderColor: 'var(--line)' }}>
                <Skeleton className="h-48 w-full" style={{ backgroundColor: 'var(--line)' }} />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" style={{ backgroundColor: 'var(--line)' }} />
                  <Skeleton className="h-4 w-3/4" style={{ backgroundColor: 'var(--line)' }} />
                  <Skeleton className="h-4 w-1/2" style={{ backgroundColor: 'var(--line)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card
                  className="h-full transition-all duration-200 cursor-pointer hover:shadow-lg border"
                  style={{
                    backgroundColor: 'var(--studio-surface)',
                    borderColor: 'var(--line)'
                  }}
                >
                  {post.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-foreground">{post.title}</CardTitle>
                    {post.excerpt && (
                      <CardDescription className="line-clamp-3" style={{ color: 'var(--ink-muted)' }}>
                        {post.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: 'var(--line)',
                            color: 'var(--ink-muted)',
                            borderColor: '#555555'
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm" style={{ color: '#aaaaaa' }}>
                      <span>{format(new Date(post.publishedAt), 'MMM d, yyyy')}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{post.viewCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--bg-color)' }}>No Blog Posts Yet</h2>
            <p style={{ color: 'var(--text-light)' }}>
              We're working on creating great content for you. Check back soon!
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
