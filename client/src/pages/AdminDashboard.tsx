import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocation } from 'wouter';
import { useSimpleToast } from '../hooks/use-simple-toast';
import { format } from 'date-fns';
import SubscriptionDialog from '@/components/admin/SubscriptionDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { queryClient } from '@/lib/queryClient';
import MarkdownEditor from '@/components/MarkdownEditor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  subscriptionTier: string;
  subscriptionExpiry: string | null;
  isAdmin: boolean;
}

interface AnalyticsData {
  userCount: number;
  lessonCount: number;
  languageCount: number;
  completedLessonCount: number;
  premiumUserCount: number;
}

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  category: string;
  message: string;
  createdAt: string;
  isResolved: boolean;
  notes: string | null;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featuredImage: string | null;
  authorId: number;
  status: string;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();
  const { toast } = useSimpleToast();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(null);
  const [showBlogEditor, setShowBlogEditor] = useState(false);
  const [showBlogPreview, setShowBlogPreview] = useState(false);
  const [blogFormData, setBlogFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    status: 'draft'
  });
  
  // Fetch analytics data
  const fetchAnalytics = async (): Promise<AnalyticsData> => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Analytics API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  };
  
  const { 
    data: analyticsData, 
    isLoading: loadingAnalytics, 
    error: analyticsError
  } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics'],
    queryFn: fetchAnalytics,
    retry: 1
  });

  // Fetch blog posts
  const { 
    data: blogPosts, 
    isLoading: loadingBlogPosts,
    refetch: refetchBlogPosts
  } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog'],
    queryFn: async () => {
      const response = await fetch('/api/admin/blog', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    },
    retry: 1
  });

  // Blog mutations
  const createBlogPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create blog post');
      return response.json();
    },
    onSuccess: () => {
      refetchBlogPosts();
      setShowBlogEditor(false);
      setBlogFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        tags: [],
        metaTitle: '',
        metaDescription: '',
        status: 'draft'
      });
      toast({ title: "Success", description: "Blog post created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create blog post", variant: "destructive" });
    }
  });

  const updateBlogPostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update blog post');
      return response.json();
    },
    onSuccess: () => {
      refetchBlogPosts();
      setShowBlogEditor(false);
      setSelectedBlogPost(null);
      toast({ title: "Success", description: "Blog post updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update blog post", variant: "destructive" });
    }
  });

  const deleteBlogPostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete blog post');
      return response.json();
    },
    onSuccess: () => {
      refetchBlogPosts();
      toast({ title: "Success", description: "Blog post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
    }
  });
  
  // Fetch users data
  const fetchUsers = async (): Promise<User[]> => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Users API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };
  
  const { 
    data: usersData, 
    isLoading: loadingUsers, 
    error: usersError 
  } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: fetchUsers,
    retry: 1
  });
  
  // If unauthorized, redirect to home page
  useEffect(() => {
    if (
      (analyticsError && (analyticsError as any).status === 403) || 
      (usersError && (usersError as any).status === 403)
    ) {
      toast({
        title: "Access Denied",
        description: "You do not have admin privileges.",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [analyticsError, usersError, setLocation, toast]);
  
  // Fetch contact submissions data
  const fetchContactSubmissions = async (): Promise<ContactSubmission[]> => {
    try {
      const response = await fetch('/api/admin/contact-submissions', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Contact submissions API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      throw error;
    }
  };
  
  const { 
    data: contactSubmissionsData, 
    isLoading: loadingSubmissions, 
    error: submissionsError,
    refetch: refetchSubmissions
  } = useQuery<ContactSubmission[]>({
    queryKey: ['/api/admin/contact-submissions'],
    queryFn: fetchContactSubmissions,
    retry: 1
  });
  
  // Function to mark a submission as resolved
  const resolveMutation = useMutation({
    mutationFn: async (submissionId: number) => {
      const response = await fetch(`/api/admin/contact-submissions/${submissionId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: resolutionNotes }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to resolve submission');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Contact submission marked as resolved.",
      });
      setSelectedSubmission(null);
      setResolutionNotes('');
      refetchSubmissions();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve submission.",
        variant: "destructive",
      });
    }
  });

  // Function to handle resolving a submission
  const handleResolveSubmission = (submission: ContactSubmission) => {
    if (!submission.id) return;
    
    resolveMutation.mutate(submission.id);
  };
  
  // Function to promote a user to admin
  const makeAdmin = async (userId: number) => {
    try {
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      toast({
        title: "Success",
        description: "User has been granted admin privileges.",
      });
      
      // Refresh users data
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user privileges.",
        variant: "destructive",
      });
    }
  };
  
  // Function to update subscription
  const updateSubscription = async (userId: number, subscriptionTier: string, subscriptionExpiry?: Date) => {
    try {
      const response = await fetch('/api/admin/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          subscriptionTier, 
          subscriptionExpiry: subscriptionExpiry ? subscriptionExpiry.toISOString() : null 
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update subscription');
      }
      
      toast({
        title: "Success",
        description: `Subscription updated to ${subscriptionTier}.`,
      });
      
      // Refresh users data
      await fetchUsers();
      
      // Close the dialog
      setSelectedUser(null);
      setShowSubscriptionDialog(false);
      
      // The caller only needs completion or a thrown error.
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Blog form handlers
  const handleBlogFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBlogPost) {
      updateBlogPostMutation.mutate({ id: selectedBlogPost.id, data: blogFormData });
    } else {
      createBlogPostMutation.mutate(blogFormData);
    }
  };

  const openBlogEditor = (post?: BlogPost) => {
    if (post) {
      setSelectedBlogPost(post);
      setBlogFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || '',
        featuredImage: post.featuredImage || '',
        tags: post.tags,
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        status: post.status
      });
    } else {
      setSelectedBlogPost(null);
      setBlogFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featuredImage: '',
        tags: [],
        metaTitle: '',
        metaDescription: '',
        status: 'draft'
      });
    }
    setShowBlogEditor(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };
  
  return (
    <div className="container mx-auto mt-16 px-4">
      <h1 className="text-3xl font-bold my-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="contact">Contact Submissions</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Users Card */}
            <Card className="border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Registered users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <Skeleton className="h-12 w-12" />
                ) : (
                  <p className="text-3xl font-bold">{(analyticsData as AnalyticsData)?.userCount || 0}</p>
                )}
              </CardContent>
            </Card>
            
            {/* Premium Users Card */}
            <Card className="border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>Premium Users</CardTitle>
                <CardDescription>Users with active subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <Skeleton className="h-12 w-12" />
                ) : (
                  <p className="text-3xl font-bold">{(analyticsData as AnalyticsData)?.premiumUserCount || 0}</p>
                )}
              </CardContent>
            </Card>
            
            {/* Available Languages Card */}
            <Card className="border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>Languages</CardTitle>
                <CardDescription>Available languages</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <Skeleton className="h-12 w-12" />
                ) : (
                  <p className="text-3xl font-bold">{(analyticsData as AnalyticsData)?.languageCount || 0}</p>
                )}
              </CardContent>
            </Card>
            
            {/* Total Lessons Card */}
            <Card className="border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>Lessons</CardTitle>
                <CardDescription>Total lessons in system</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <Skeleton className="h-12 w-12" />
                ) : (
                  <p className="text-3xl font-bold">{(analyticsData as AnalyticsData)?.lessonCount || 0}</p>
                )}
              </CardContent>
            </Card>
            
            {/* Completed Lessons Card */}
            <Card className="border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>Completed Lessons</CardTitle>
                <CardDescription>Total lessons completed by users</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <Skeleton className="h-12 w-12" />
                ) : (
                  <p className="text-3xl font-bold">{(analyticsData as AnalyticsData)?.completedLessonCount || 0}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="border border-gray-800">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData && usersData.length > 0 ? (
                        usersData.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.id}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.subscriptionTier || 'Free'}</TableCell>
                            <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {!user.isAdmin && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => makeAdmin(user.id)}
                                  >
                                    Make Admin
                                  </Button>
                                )}
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowSubscriptionDialog(true);
                                  }}
                                >
                                  Subscription
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            No users found. {usersError ? 'Error loading users.' : ''}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Blog Tab */}
        <TabsContent value="blog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Blog Management</h2>
            <Button onClick={() => openBlogEditor()}>
              Create New Post
            </Button>
          </div>
          
          {loadingBlogPosts ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts && blogPosts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-gray-500">/{post.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{post.viewCount}</TableCell>
                        <TableCell>
                          {format(new Date(post.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBlogPost(post);
                                setShowBlogPreview(true);
                              }}
                            >
                              Preview
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openBlogEditor(post)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteBlogPostMutation.mutate(post.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Card>
                  <CardContent className="text-center py-6">
                    <p>No blog posts yet. Create your first post to get started!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        {/* Contact Submissions Tab */}
        <TabsContent value="contact">
          <Card className="border border-gray-800">
            <CardHeader>
              <CardTitle>Contact Form Submissions</CardTitle>
              <CardDescription>View and manage user inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  {selectedSubmission ? (
                    <div className="space-y-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedSubmission(null)}
                        className="mb-4"
                      >
                        Back to list
                      </Button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="text-lg font-medium">Submission Details</h3>
                          <p><strong>Name:</strong> {selectedSubmission.name}</p>
                          <p><strong>Email:</strong> {selectedSubmission.email}</p>
                          <p><strong>Category:</strong> {selectedSubmission.category}</p>
                          <p><strong>Date:</strong> {format(new Date(selectedSubmission.createdAt), 'PPP pp')}</p>
                          <p><strong>Status:</strong> 
                            <Badge className="ml-2" variant={selectedSubmission.isResolved ? "outline" : "default"}>
                              {selectedSubmission.isResolved ? 'Resolved' : 'Pending'}
                            </Badge>
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium">Message</h3>
                          <div className="rounded-md border border-gray-200 p-4 mt-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                            <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedSubmission.notes && (
                        <div className="mt-4">
                          <h3 className="text-lg font-medium">Resolution Notes</h3>
                          <div className="rounded-md border border-gray-200 p-4 mt-2 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                            <p className="whitespace-pre-wrap">{selectedSubmission.notes}</p>
                          </div>
                        </div>
                      )}
                      
                      {!selectedSubmission.isResolved && (
                        <div className="mt-4">
                          <h3 className="text-lg font-medium">Resolve Submission</h3>
                          <Textarea 
                            className="mt-2" 
                            placeholder="Enter resolution notes here..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                          />
                          <Button 
                            className="mt-2" 
                            onClick={() => handleResolveSubmission(selectedSubmission)}
                            disabled={resolveMutation.isPending}
                          >
                            {resolveMutation.isPending ? 'Resolving...' : 'Mark as Resolved'}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contactSubmissionsData && contactSubmissionsData.length > 0 ? (
                            contactSubmissionsData.map((submission) => (
                              <TableRow key={submission.id}>
                                <TableCell>{submission.id}</TableCell>
                                <TableCell>{format(new Date(submission.createdAt), 'PP')}</TableCell>
                                <TableCell>{submission.name}</TableCell>
                                <TableCell>{submission.email}</TableCell>
                                <TableCell>{submission.category}</TableCell>
                                <TableCell>
                                  <Badge variant={submission.isResolved ? "outline" : "default"}>
                                    {submission.isResolved ? 'Resolved' : 'Pending'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setSelectedSubmission(submission)}
                                  >
                                    View Details
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-6">
                                No contact submissions found. {submissionsError ? 'Error loading data.' : ''}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Subscription Dialog */}
      {selectedUser && (
        <SubscriptionDialog
          isOpen={showSubscriptionDialog}
          onClose={() => setShowSubscriptionDialog(false)}
          user={selectedUser}
          onSave={updateSubscription}
        />
      )}

      {/* Blog Editor Dialog */}
      <Dialog open={showBlogEditor} onOpenChange={setShowBlogEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedBlogPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleBlogFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={blogFormData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setBlogFormData(prev => ({
                      ...prev,
                      title,
                      slug: generateSlug(title)
                    }));
                  }}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={blogFormData.slug}
                  onChange={(e) => setBlogFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt (SEO Description)</Label>
              <Textarea
                id="excerpt"
                value={blogFormData.excerpt}
                onChange={(e) => setBlogFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={2}
                placeholder="Brief description for search engines..."
              />
            </div>

            <MarkdownEditor
              value={blogFormData.content}
              onChange={(content) => setBlogFormData(prev => ({ ...prev, content }))}
              placeholder="Write your blog post content in Markdown...\n\nTip: You can drag & drop images or paste them directly!"
              rows={20}
            />

            <div>
              <Label htmlFor="featuredImage">Featured Image</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="featuredImage"
                    value={blogFormData.featuredImage}
                    onChange={(e) => setBlogFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg or upload below"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('featuredImageFile')?.click()}
                  >
                    Upload
                  </Button>
                </div>
                <input
                  type="file"
                  id="featuredImageFile"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const formData = new FormData();
                        formData.append('image', file);
                        const response = await fetch('/api/admin/blog/upload-image', {
                          method: 'POST',
                          body: formData,
                        });
                        const result = await response.json();
                        if (response.ok) {
                          setBlogFormData(prev => ({ ...prev, featuredImage: result.url }));
                        }
                      } catch (error) {
                        console.error('Failed to upload featured image:', error);
                      }
                    }
                  }}
                />
                {blogFormData.featuredImage && (
                  <div className="relative">
                    <img 
                      src={blogFormData.featuredImage} 
                      alt="Featured image preview" 
                      className="w-full h-32 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1"
                      onClick={() => setBlogFormData(prev => ({ ...prev, featuredImage: '' }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={blogFormData.status}
                onValueChange={(value) => setBlogFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={blogFormData.tags.join(', ')}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only split and process if there's a comma, otherwise keep as is for typing
                  if (value.includes(',')) {
                    setBlogFormData(prev => ({ 
                      ...prev, 
                      tags: value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }));
                  } else {
                    // For single tag being typed, just update the input
                    setBlogFormData(prev => ({ 
                      ...prev, 
                      tags: value ? [value] : []
                    }));
                  }
                }}
                placeholder="language learning, tips, grammar"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metaTitle">SEO Title</Label>
                <Input
                  id="metaTitle"
                  value={blogFormData.metaTitle}
                  onChange={(e) => setBlogFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Custom title for search engines"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">SEO Meta Description</Label>
                <Input
                  id="metaDescription"
                  value={blogFormData.metaDescription}
                  onChange={(e) => setBlogFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Description for search results"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowBlogEditor(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createBlogPostMutation.isPending || updateBlogPostMutation.isPending}
              >
                {createBlogPostMutation.isPending || updateBlogPostMutation.isPending 
                  ? 'Saving...' 
                  : selectedBlogPost ? 'Update Post' : 'Create Post'
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Blog Preview Dialog */}
      <Dialog open={showBlogPreview} onOpenChange={setShowBlogPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {selectedBlogPost?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedBlogPost && (
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b pb-6">
                <h1 className="text-3xl font-bold mb-3">{selectedBlogPost.title}</h1>
                
                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <span>Status:</span>
                    <Badge variant={selectedBlogPost.status === 'published' ? 'default' : 'secondary'}>
                      {selectedBlogPost.status}
                    </Badge>
                  </div>
                  <div>Views: {selectedBlogPost.viewCount}</div>
                  <div>Created: {format(new Date(selectedBlogPost.createdAt), 'MMM d, yyyy')}</div>
                </div>

                {/* Tags */}
                {selectedBlogPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedBlogPost.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Excerpt */}
                {selectedBlogPost.excerpt && (
                  <p className="text-lg text-gray-600 italic">{selectedBlogPost.excerpt}</p>
                )}
              </div>

              {/* Featured Image */}
              {selectedBlogPost.featuredImage && (
                <div className="aspect-video w-full overflow-hidden rounded-lg">
                  <img
                    src={selectedBlogPost.featuredImage}
                    alt={selectedBlogPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-medium mt-4 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary/20 pl-4 my-4 italic text-gray-700 dark:text-gray-300">
                        {children}
                      </blockquote>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className?.includes('language-');
                      return isInline ? (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>
                      ) : (
                        <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">{children}</code>
                      );
                    },
                    img: ({ src, alt }) => (
                      <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full h-auto rounded-lg my-4"
                      />
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        className="text-primary hover:underline"
                        target={href?.startsWith('http') ? '_blank' : undefined}
                        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {selectedBlogPost.content}
                </ReactMarkdown>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBlogPreview(false)}
                >
                  Close Preview
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowBlogPreview(false);
                      openBlogEditor(selectedBlogPost);
                    }}
                  >
                    Edit Post
                  </Button>
                  {selectedBlogPost.status === 'draft' && (
                    <Button 
                      onClick={() => {
                        updateBlogPostMutation.mutate({ 
                          id: selectedBlogPost.id, 
                          data: { status: 'published', publishedAt: new Date() }
                        });
                        setShowBlogPreview(false);
                      }}
                    >
                      Publish Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}