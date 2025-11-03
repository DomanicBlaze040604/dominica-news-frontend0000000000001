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
import { authorsService, AuthorFormData } from '../../services/authors';
import { DragDropImageUpload } from '../../components/admin/DragDropImageUpload';
import { LazyImage } from '../../components/LazyImage';
import { Plus, Edit, Trash2, Search, User, Mail, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Author } from '../../types/api';

const authorSchema = z.object({
  name: z.string().min(2, 'Author name must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  biography: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  isActive: z.boolean().optional(),
});

type AuthorFormDataType = z.infer<typeof authorSchema>;

export const AdminAuthors: React.FC = () => {
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [profileImageData, setProfileImageData] = useState<any>(null);
  const [profileImageAlt, setProfileImageAlt] = useState('');
  const queryClient = useQueryClient();

  // Fetch authors
  const { data: authorsData, isLoading } = useQuery({
    queryKey: ['admin-authors'],
    queryFn: authorsService.getAdminAuthors,
  });

  const authors = authorsData?.data.authors || [];

  // Filter authors based on search term
  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Form setup
  const form = useForm<AuthorFormDataType>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
      role: '',
      biography: '',
      email: '',
      isActive: true,
    },
  });

  // Create author mutation
  const createMutation = useMutation({
    mutationFn: (data: AuthorFormData) => authorsService.createAuthor(data),
    onSuccess: () => {
      toast.success('Author created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create author');
    },
  });

  // Update author mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AuthorFormData> }) =>
      authorsService.updateAuthor(id, data),
    onSuccess: () => {
      toast.success('Author updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update author');
    },
  });

  // Delete author mutation
  const deleteMutation = useMutation({
    mutationFn: authorsService.deleteAuthor,
    onSuccess: () => {
      toast.success('Author deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete author');
    },
  });

  const resetForm = () => {
    setEditingAuthor(null);
    setProfileImageData(null);
    setProfileImageAlt('');
    form.reset({
      name: '',
      role: '',
      biography: '',
      email: '',
      isActive: true,
    });
  };

  const handleSubmit = (data: AuthorFormDataType) => {
    const formData: AuthorFormData = {
      name: data.name,
      role: data.role,
      email: data.email,
      biography: data.biography,
      isActive: data.isActive,
      profileImage: profileImageData?.urls?.medium || undefined,
    };

    if (editingAuthor) {
      updateMutation.mutate({ id: editingAuthor.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setProfileImageData(author.profileImage ? { urls: { medium: author.profileImage } } : null);
    setProfileImageAlt('Author profile photo');
    form.reset({
      name: author.name,
      role: author.role,
      biography: author.biography || '',
      email: author.email,
      isActive: author.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (authorId: string) => {
    if (window.confirm('Are you sure you want to delete this author? This action cannot be undone.')) {
      deleteMutation.mutate(authorId);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleImageUploaded = (imageData: any) => {
    setProfileImageData(imageData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authors</h1>
          <p className="text-gray-600">Manage journalist profiles and editorial team</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Author
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAuthor ? 'Edit Author' : 'Create New Author'}
              </DialogTitle>
              <DialogDescription>
                {editingAuthor 
                  ? 'Update the author information below.'
                  : 'Add a new author to your editorial team.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Profile Image Upload */}
              <div>
                <Label className="text-base font-medium">Profile Image</Label>
                <div className="mt-2">
                  <DragDropImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImageUrl={profileImageData?.urls?.medium}
                    altText={profileImageAlt}
                    onAltTextChange={setProfileImageAlt}
                  />
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter author's full name..."
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="author@dominicanews.com"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role/Title *</Label>
                <Input
                  id="role"
                  placeholder="e.g., Senior Political Journalist, Feature Writer..."
                  {...form.register('role')}
                />
                {form.formState.errors.role && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="biography">Biography</Label>
                <Textarea
                  id="biography"
                  placeholder="Enter author's biography and background..."
                  rows={4}
                  {...form.register('biography')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be displayed on the Editorial Team page and author profiles.
                </p>
                {form.formState.errors.biography && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.biography.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={form.watch('isActive')}
                  onCheckedChange={(checked) => form.setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Active Author</Label>
                <p className="text-xs text-gray-500">
                  Inactive authors won't appear in author selection or public pages
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
                    : editingAuthor
                    ? 'Update Author'
                    : 'Create Author'
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
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredAuthors.length} of {authors.length} authors
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Authors table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Editorial Team ({authors.length})
          </CardTitle>
          <CardDescription>
            Manage your editorial team and journalist profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAuthors.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <div>
                  <p className="text-gray-500 mb-4">No authors found matching "{searchTerm}"</p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear search
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-4">No authors found</p>
                  <Button onClick={openCreateDialog}>Create your first author</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuthors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {author.profileImage ? (
                              <LazyImage
                                src={author.profileImage}
                                alt={`${author.name} profile`}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{author.name}</p>
                            {author.biography && (
                              <p className="text-sm text-gray-500 max-w-xs truncate">
                                {author.biography}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{author.role}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{author.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={author.isActive ? "default" : "secondary"}>
                          {author.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(author.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(author)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(author.id)}
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