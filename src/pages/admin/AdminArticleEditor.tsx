import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DragDropImageUpload } from '@/components/admin/DragDropImageUpload';
import { articlesService } from '../../services/articles';
import { categoriesService } from '../../services/categories';
import { authorsService } from '../../services/authors';
import { ArticleFormData as ApiArticleFormData } from '../../types/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, Calendar, Pin, Search, Plus } from 'lucide-react';
import { formatForDateTimeInput, parseLocalTimeToUTC, getCurrentLocalTime } from '../../utils/timezone';

const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  excerpt: z.string().optional(),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  categoryId: z.string().min(1, 'Please select a category'),
  authorId: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  scheduledAt: z.string().optional(),
  isPinned: z.boolean().optional(),
  seoTitle: z.string().max(60, 'SEO title cannot exceed 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description cannot exceed 160 characters').optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export const AdminArticleEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id && id !== 'new';
  const [uploadedImage, setUploadedImage] = React.useState<any>(null);
  const [imageAltText, setImageAltText] = React.useState<string>('');

  // Fetch article data if editing
  const { data: articleData, isLoading: isLoadingArticle } = useQuery({
    queryKey: ['admin-article', id],
    queryFn: () => articlesService.getAdminArticleById(id!),
    enabled: isEditing,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getCategories,
  });

  // Fetch authors
  const { data: authorsData } = useQuery({
    queryKey: ['authors'],
    queryFn: authorsService.getAuthors,
  });

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      featuredImageAlt: '',
      categoryId: '',
      authorId: '',
      status: 'draft',
      scheduledAt: '',
      isPinned: false,
      seoTitle: '',
      seoDescription: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (articleData?.data.article) {
      const article = articleData.data.article;
      form.reset({
        title: article.title,
        excerpt: article.excerpt || '',
        content: article.content,
        featuredImage: article.featuredImage || '',
        featuredImageAlt: article.featuredImageAlt || '',
        categoryId: article.category.id,
        authorId: article.author.id,
        status: article.status,
        scheduledAt: article.scheduledAt ? formatForDateTimeInput(article.scheduledAt) : '',
        isPinned: article.isPinned || false,
        seoTitle: article.seoTitle || '',
        seoDescription: article.seoDescription || '',
      });
      setImageAltText(article.featuredImageAlt || '');
    }
  }, [articleData, form]);

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: articlesService.createArticle,
    onSuccess: () => {
      toast.success('Article created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      navigate('/admin/articles');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create article');
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: (data: ApiArticleFormData) => articlesService.updateArticle(id!, data),
    onSuccess: () => {
      toast.success('Article updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-article', id] });
      navigate('/admin/articles');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update article');
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    // Use uploaded image URL if available, otherwise use the form value
    const submitData: ApiArticleFormData = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      featuredImage: uploadedImage?.urls?.medium || data.featuredImage || '',
      featuredImageAlt: imageAltText || data.featuredImageAlt || '',
      categoryId: data.categoryId,
      authorId: data.authorId,
      status: data.status,
      scheduledAt: data.scheduledAt ? parseLocalTimeToUTC(data.scheduledAt).toISOString() : undefined,
      isPinned: data.isPinned,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    };

    // Validate scheduled date if status is scheduled
    if (data.status === 'scheduled') {
      if (!data.scheduledAt) {
        toast.error('Please select a scheduled date and time');
        return;
      }
      const scheduledDate = parseLocalTimeToUTC(data.scheduledAt);
      if (scheduledDate <= getCurrentLocalTime()) {
        toast.error('Scheduled date must be in the future');
        return;
      }
    }

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleImageUploaded = (imageData: any) => {
    setUploadedImage(imageData);
    if (imageData) {
      form.setValue('featuredImage', imageData.urls.medium);
      form.setValue('featuredImageAlt', imageData.altText);
      setImageAltText(imageData.altText);
    } else {
      form.setValue('featuredImage', '');
      form.setValue('featuredImageAlt', '');
      setImageAltText('');
    }
  };

  const handleAltTextChange = (altText: string) => {
    setImageAltText(altText);
    form.setValue('featuredImageAlt', altText);
  };

  const isLoading = isLoadingArticle || createMutation.isPending || updateMutation.isPending;
  const categories = categoriesData?.data.categories || [];
  const authors = authorsData?.data.authors || [];
  const currentStatus = form.watch('status');
  const isPinnedValue = form.watch('isPinned');

  if (isEditing && isLoadingArticle) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/articles')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Article' : 'New Article'}
            </h1>
            <p className="text-sm text-gray-600">
              {isEditing ? 'Update your article' : 'Create a new article'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
                <CardDescription>The main content of your article</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter article title..."
                    {...form.register('title')}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt (Optional)</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief description of the article..."
                    rows={3}
                    {...form.register('excerpt')}
                  />
                  {form.formState.errors.excerpt && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.excerpt.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="content">Content</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // This would open a file picker for inline content uploads
                        // For now, we'll show a toast indicating the feature
                        toast.info('File upload feature coming soon! Use the Featured Image section for now.');
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add File
                    </Button>
                  </div>
                  <Textarea
                    id="content"
                    placeholder="Write your article content here..."
                    rows={15}
                    {...form.register('content')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the "Add File" button to insert images or documents into your content.
                  </p>
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.content.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publish Settings</CardTitle>
                <CardDescription>Control how your article is published</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value: 'draft' | 'published' | 'scheduled') => {
                      form.setValue('status', value);
                      // Clear scheduled date if not scheduling
                      if (value !== 'scheduled') {
                        form.setValue('scheduledAt', '');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Save as Draft</SelectItem>
                      <SelectItem value="published">Publish Now</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>

                {currentStatus === 'scheduled' && (
                  <div>
                    <Label htmlFor="scheduledAt">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Schedule Date & Time
                    </Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      {...form.register('scheduledAt')}
                      min={formatForDateTimeInput(getCurrentLocalTime())}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Time is in Dominica timezone (UTC-4)
                    </p>
                    {form.formState.errors.scheduledAt && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.scheduledAt.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPinned"
                    checked={isPinnedValue}
                    onCheckedChange={(checked) => form.setValue('isPinned', checked)}
                  />
                  <Label htmlFor="isPinned" className="flex items-center">
                    <Pin className="w-4 h-4 mr-1" />
                    Pin to Featured
                  </Label>
                </div>

                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    value={form.watch('categoryId')}
                    onValueChange={(value) => form.setValue('categoryId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                  <Select
                    value=""
                    onValueChange={() => {
                      // Placeholder for future subcategory functionality
                      toast.info('Subcategory feature coming soon!');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No subcategories available</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Subcategories will be available in a future update.
                  </p>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value="en"
                    onValueChange={() => {
                      // Placeholder for future language functionality
                      toast.info('Multi-language support coming soon!');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Currently only English is supported. Multi-language support coming soon.
                  </p>
                </div>

                <div>
                  <Label htmlFor="authorId">Author</Label>
                  <Select
                    value={form.watch('authorId')}
                    onValueChange={(value) => form.setValue('authorId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name} - {author.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.authorId && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.authorId.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Featured Image</Label>
                  <DragDropImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImageUrl={form.watch('featuredImage')}
                    altText={imageAltText}
                    onAltTextChange={handleAltTextChange}
                    disabled={isLoading}
                  />
                  {form.formState.errors.featuredImage && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.featuredImage.message}
                    </p>
                  )}
                  {form.formState.errors.featuredImageAlt && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.featuredImageAlt.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  SEO Settings
                </CardTitle>
                <CardDescription>Optimize your article for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    placeholder="Custom title for search engines (max 60 chars)"
                    maxLength={60}
                    {...form.register('seoTitle')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.watch('seoTitle')?.length || 0}/60 characters
                  </p>
                  {form.formState.errors.seoTitle && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.seoTitle.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    placeholder="Brief description for search results (max 160 chars)"
                    maxLength={160}
                    rows={3}
                    {...form.register('seoDescription')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.watch('seoDescription')?.length || 0}/160 characters
                  </p>
                  {form.formState.errors.seoDescription && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.seoDescription.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Saving...' : 
                     currentStatus === 'scheduled' ? 'Schedule Article' :
                     currentStatus === 'published' ? (isEditing ? 'Update Article' : 'Publish Article') :
                     'Save as Draft'}
                  </Button>
                  
                  {isEditing && form.watch('status') === 'published' && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const article = articleData?.data.article;
                        if (article) {
                          window.open(`/articles/${article.slug}`, '_blank');
                        }
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Article
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};