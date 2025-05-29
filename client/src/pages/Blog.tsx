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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - matching your app's style */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              LingoMitra Blog
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Discover language learning tips, cultural insights, and expert guidance to accelerate your multilingual journey.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Section */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <Skeleton className="h-48 w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer bg-white border border-gray-200">
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
                    <CardTitle className="line-clamp-2 text-gray-900">{post.title}</CardTitle>
                    {post.excerpt && (
                      <CardDescription className="line-clamp-3 text-gray-600">
                        {post.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">No Blog Posts Yet</h2>
            <p className="text-gray-600">
              We're working on creating great content for you. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}