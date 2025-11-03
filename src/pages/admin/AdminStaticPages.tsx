import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { staticPagesService, StaticPageFormData } from '../../services/staticPages';
import { Plus, Edit, Trash2, Search, FileText, Globe, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StaticPage } from '../../services/staticPages';

const staticPageSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  metaTitle: z.string().max(60, 'Meta title cannot exceed 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description cannot exceed 160 characters').optional(),
  isPublished: z.boolean().optional(),
});

type StaticPageFormDataType = z.infer<typeof staticPageSchema>;

export const AdminStaticPages: React.FC = () => {
  const [editingPage, setEditingPage] = useState<StaticPage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const queryClient = useQueryClient();

  // Fetch static pages
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['admin-static-pages', showPublishedOnly],
    queryFn: () => staticPagesService.getAdminPages(showPublishedOnly ? true : undefined),
  });

  const pages = pagesData?.data.data || [];

  // Filter pages based on search term
  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (page.metaTitle && page.metaTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Form setup
  const form = useForm<StaticPageFormDataType>({
    resolver: zodResolver(staticPageSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: true,
    },
  });

  // Create page mutation
  const createMutation = useMutation({
    mutationFn: (data: StaticPageFormData) => staticPagesService.createPage(data),
    onSuccess: () => {
      toast.success('Static page created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-static-pages'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create page');
    },
  });

  // Update page mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StaticPageFormData> }) =>
      staticPagesService.updatePage(id, data),
    onSuccess: () => {
      toast.success('Static page updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-static-pages'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update page');
    },
  });

  // Delete page mutation
  const deleteMutation = useMutation({
    mutationFn: staticPagesService.deletePage,
    onSuccess: () => {
      toast.success('Static page deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-static-pages'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete page');
    },
  });

  const resetForm = () => {
    setEditingPage(null);
    form.reset({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      isPublished: true,
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
    if (!editingPage && !form.getValues('slug')) {
      form.setValue('slug', generateSlug(title));
    }
  };

  const handleSubmit = (data: StaticPageFormDataType) => {
    const formData: StaticPageFormData = {
      title: data.title,
      content: data.content,
      slug: data.slug || generateSlug(data.title),
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      isPublished: data.isPublished,
    };

    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (page: StaticPage) => {
    setEditingPage(page);
    form.reset({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      isPublished: page.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      deleteMutation.mutate(pageId);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getPageUrl = (slug: string) => {
    return `${window.location.origin}/pages/${slug}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Static Pages</h1>
          <p className="text-gray-600">Manage your website's static content pages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Edit Static Page' : 'Create New Static Page'}
              </DialogTitle>
              <DialogDescription>
                {editingPage 
                  ? 'Update the page information below.'
                  : 'Create a new static page for your website.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter page title..."
                    value={form.watch('title')}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="page-url-slug"
                    {...form.register('slug')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL: /pages/{form.watch('slug') || 'page-url-slug'}
                  </p>
                  {form.formState.errors.slug && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Page Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your page content here... You can use HTML for formatting."
                  rows={12}
                  {...form.register('content')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting (h1, h2, p, a, strong, em, ul, ol, li, etc.)
                </p>
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              {/* SEO Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SEO Settings</h3>
                
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="SEO title for search engines..."
                    {...form.register('metaTitle')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.watch('metaTitle')?.length || 0}/60 characters
                  </p>
                  {form.formState.errors.metaTitle && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.metaTitle.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="Brief description for search engines..."
                    rows={3}
                    {...form.register('metaDescription')}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.watch('metaDescription')?.length || 0}/160 characters
                  </p>
                  {form.formState.errors.metaDescription && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.metaDescription.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Publishing */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublished"
                  checked={form.watch('isPublished')}
                  onCheckedChange={(checked) => form.setValue('isPublished', checked)}
                />
                <Label htmlFor="isPublished">Published</Label>
                <p className="text-xs text-gray-500">
                  Unpublished pages won't be accessible to visitors
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingPage
                    ? 'Update Page'
                    : 'Create Page'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="publishedOnly"
                  checked={showPublishedOnly}
                  onCheckedChange={setShowPublishedOnly}
                />
                <Label htmlFor="publishedOnly" className="text-sm">Published only</Label>
              </div>
              <div className="text-sm text-gray-500">
                {filteredPages.length} of {pages.length} pages
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Static Pages ({pages.length})
          </CardTitle>
          <CardDescription>
            Manage your website's static content pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm || showPublishedOnly ? (
                <div>
                  <p className="text-gray-500 mb-4">
                    No pages found {searchTerm && `matching "${searchTerm}"`}
                    {showPublishedOnly && ' (published only)'}
                  </p>
                  <div className="space-x-2">
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
                        Clear search
                      </Button>
                    )}
                    {showPublishedOnly && (
                      <Button variant="outline" onClick={() => setShowPublishedOnly(false)}>
                        Show all pages
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-4">No static pages found</p>
                  <Button onClick={openCreateDialog}>Create your first page</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>SEO</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{page.title}</p>
                            <p className="text-sm text-gray-500 max-w-xs truncate">
                              {page.content.replace(/<[^>]*>/g, '').substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            /pages/{page.slug}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {page.metaTitle && (
                            <p className="text-xs text-gray-600 truncate max-w-xs">
                              Title: {page.metaTitle}
                            </p>
                          )}
                          {page.metaDescription && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">
                              Desc: {page.metaDescription}
                            </p>
                          )}
                          {!page.metaTitle && !page.metaDescription && (
                            <p className="text-xs text-gray-400">No SEO data</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.isPublished ? "default" : "secondary"}>
                          {page.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(page.updatedAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {page.isPublished && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(getPageUrl(page.slug), '_blank')}
                              title="View page"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(page)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(page.id)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};