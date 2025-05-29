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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              LingoMitra Blog
            </h1>
            <p className="text-xl md:text-2xl text-orange-100 leading-relaxed">
              Discover language learning tips, cultural insights, and expert guidance to accelerate your multilingual journey.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Posts Section */}
      <div className="container mx-auto px-4 py-16">
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
          <>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest Articles</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Expert insights and practical tips to enhance your language learning experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {posts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className={`group h-full hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2 ${
                    index === 0 && posts.length > 1 ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}>
                    {post.featuredImage && (
                      <div className={`overflow-hidden rounded-t-lg ${index === 0 && posts.length > 1 ? 'aspect-[21/9]' : 'aspect-video'}`}>
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className={`group-hover:text-orange-600 transition-colors ${
                        index === 0 && posts.length > 1 ? 'text-2xl md:text-3xl' : 'text-xl'
                      } line-clamp-2`}>
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className={`leading-relaxed ${
                          index === 0 && posts.length > 1 ? 'text-lg line-clamp-3' : 'text-base line-clamp-2'
                        }`}>
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center">
                        <time className="text-sm text-gray-500 font-medium">
                          {format(new Date(post.publishedAt), 'MMM d, yyyy')}
                        </time>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{post.viewCount}</span>
                          </div>
                          <div className="flex items-center text-orange-600 text-sm font-semibold group-hover:text-orange-700">
                            Read more
                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-lg text-gray-600">We're working on amazing content for you. Check back soon for language learning insights and tips!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}