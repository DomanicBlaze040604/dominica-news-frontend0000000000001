import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { articlesService } from '../../services/articles';
import { categoriesService } from '../../services/categories';
import { imagesService } from '../../services/images';
import { TestConnection } from '../../components/TestConnection';
import { AdminErrorFallback } from '../../components/ErrorFallbacks';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { AdminStatusIndicator } from '../../components/admin/AdminStatusIndicator';
import { FileText, FolderOpen, Image, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminDashboardContent: React.FC = () => {
  // Fetch dashboard statistics using admin endpoints
  const { data: articlesData, error: articlesError, isLoading: articlesLoading } = useQuery({
    queryKey: ['admin-articles', { page: 1, limit: 1 }],
    queryFn: () => articlesService.getAdminArticles({ page: 1, limit: 1 }),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
  });

  // Debug logging
  React.useEffect(() => {
    if (articlesData) {
      console.log('📰 Articles Data:', articlesData);
    }
    if (articlesError) {
      console.error('❌ Articles Error:', articlesError);
    }
  }, [articlesData, articlesError]);

  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoriesService.getAdminCategories,
    retry: 1,
    retryDelay: 1000,
    staleTime: 60000, // 1 minute
  });

  // Debug logging
  React.useEffect(() => {
    if (categoriesData) {
      console.log('📊 Categories Data:', categoriesData);
    }
    if (categoriesError) {
      console.error('❌ Categories Error:', categoriesError);
    }
  }, [categoriesData, categoriesError]);

  const { data: imagesData, isLoading: imagesLoading } = useQuery({
    queryKey: ['admin-images', { page: 1, limit: 1 }],
    queryFn: () => imagesService.getImages({ page: 1, limit: 1 }),
    retry: 1,
    retryDelay: 1000,
    staleTime: 60000, // 1 minute
  });

  const { data: publishedArticlesData, isLoading: publishedLoading } = useQuery({
    queryKey: ['admin-articles', { page: 1, limit: 1, status: 'published' }],
    queryFn: () => articlesService.getAdminArticles({ page: 1, limit: 1, status: 'published' }),
    retry: 1,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
  });

  // Check for critical errors
  const hasErrors = articlesError || categoriesError;
  const isLoading = articlesLoading || categoriesLoading || imagesLoading || publishedLoading;

  if (hasErrors) {
    return (
      <AdminErrorFallback
        feature="dashboard"
        onRetry={() => window.location.reload()}
        onGoHome={() => window.location.href = '/admin'}
      />
    );
  }

  const stats = [
    {
      title: 'Total Articles',
      value: articlesData?.data?.pagination?.totalArticles || 0,
      description: 'All articles in the system',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Published Articles',
      value: publishedArticlesData?.data?.pagination?.totalArticles || 0,
      description: 'Articles visible to readers',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Categories',
      value: categoriesData?.data?.length || 0,
      description: 'Content categories',
      icon: FolderOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Images',
      value: imagesData?.data?.pagination?.totalImages || 0,
      description: 'Uploaded media files',
      icon: Image,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <AdminStatusIndicator showFullStatus={true} />

      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your admin dashboard. Here's an overview of your content.
        </p>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col space-y-2">
              <a
                href="/admin/articles/new"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create New Article
              </a>
              <a
                href="/admin/categories"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Manage Categories
              </a>
              <a
                href="/admin/images"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Image className="mr-2 h-4 w-4" />
                Upload Images
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest changes to your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System initialized</p>
                  <p className="text-xs text-gray-500">Ready to create content</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backend Connection Test */}
      <div className="mt-8">
        <TestConnection />
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={
        <AdminErrorFallback
          feature="dashboard"
          onRetry={() => window.location.reload()}
          onGoHome={() => window.location.href = '/admin'}
        />
      }
    >
      <AdminDashboardContent />
    </ErrorBoundary>
  );
};