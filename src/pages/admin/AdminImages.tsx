import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LazyImage } from '@/components/LazyImage';
import { imagesService } from '../../services/images';
import { Upload, Trash2, Eye, Copy, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const AdminImages: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const queryClient = useQueryClient();

  // Fetch images
  const { data: imagesData, isLoading } = useQuery({
    queryKey: ['admin-images', { page }],
    queryFn: () => imagesService.getImages({ page, limit: 20 }),
  });

  const images = imagesData?.data.images || [];
  const pagination = imagesData?.data.pagination;

  // Upload image mutation
  const uploadMutation = useMutation({
    mutationFn: imagesService.uploadImage,
    onSuccess: () => {
      toast.success('Image uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to upload image');
    },
  });

  // Delete image mutation
  const deleteMutation = useMutation({
    mutationFn: imagesService.deleteImage,
    onSuccess: () => {
      toast.success('Image deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete image');
    },
  });

  // Handle file upload
  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    uploadMutation.mutate(file);
  }, [uploadMutation]);

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  const handleDelete = (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      deleteMutation.mutate(imageId);
    }
  };

  const copyImageUrl = (image: any) => {
    navigator.clipboard.writeText(image.url);
    toast.success('Image URL copied to clipboard!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Images</h1>
          <p className="text-gray-600">Manage your media library</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Drag and drop images here or click to select files. Supports JPEG, PNG, and WebP up to 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop images here or click to upload
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, WebP up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload"
                disabled={uploadMutation.isPending}
              />
              <Button
                asChild
                disabled={uploadMutation.isPending}
                className="cursor-pointer"
              >
                <label htmlFor="file-upload">
                  {uploadMutation.isPending ? 'Uploading...' : 'Select Images'}
                </label>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            Media Library ({pagination?.totalImages || 0})
          </CardTitle>
          <CardDescription>
            Click on an image to view details or copy its URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">No images uploaded yet</p>
              <p className="text-sm text-gray-400">
                Upload your first image using the area above
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="group relative">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="cursor-pointer">
                          <LazyImage
                            src={image.thumbnailUrl}
                            alt={image.originalName}
                            className="w-full aspect-square object-cover rounded-lg border hover:shadow-md transition-shadow"
                            useIntersectionObserver={true}
                            threshold={0.1}
                            rootMargin="100px"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{image.originalName}</DialogTitle>
                          <DialogDescription>
                            Image details and actions
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <LazyImage
                            src={image.url}
                            alt={image.originalName}
                            className="w-full max-h-96 object-contain rounded-lg border"
                            useIntersectionObserver={false} // Don't lazy load modal images
                          />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">File Size</p>
                              <p className="text-gray-600">{formatFileSize(image.fileSize)}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Dimensions</p>
                              <p className="text-gray-600">
                                {image.width} × {image.height}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Type</p>
                              <p className="text-gray-600">{image.mimeType}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">Uploaded</p>
                              <p className="text-gray-600">
                                {format(new Date(image.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyImageUrl(image)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy URL
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(image.url, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Size
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(image.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-8 space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};