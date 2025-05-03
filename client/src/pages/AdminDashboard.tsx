import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [, setLocation] = useLocation();
  const { toast } = useSimpleToast();
  
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
  
  return (
    <div className="container mx-auto mt-16 px-4">
      <h1 className="text-3xl font-bold my-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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
                              {!user.isAdmin && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => makeAdmin(user.id)}
                                >
                                  Make Admin
                                </Button>
                              )}
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
      </Tabs>
    </div>
  );
}