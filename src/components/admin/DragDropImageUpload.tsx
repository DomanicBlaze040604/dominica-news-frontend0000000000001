import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LazyImage } from '../LazyImage';
import { toast } from 'sonner';
import { imagesService } from '../../services/images';

interface DragDropImageUploadProps {
  onImageUploaded: (imageData: any) => void;
  currentImageUrl?: string;
  altText?: string;
  onAltTextChange?: (altText: string) => void;
  disabled?: boolean;
}

export const DragDropImageUpload: React.FC<DragDropImageUploadProps> = ({
  onImageUploaded,
  currentImageUrl,
  altText = '',
  onAltTextChange,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [localAltText, setLocalAltText] = useState(altText);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    // Check specific image types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, and WebP images are allowed';
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    if (!localAltText.trim()) {
      toast.error('Please provide alt text for accessibility');
      return;
    }

    if (localAltText.trim().length < 3) {
      toast.error('Alt text must be at least 3 characters long');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('altText', localAltText.trim());

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await imagesService.uploadImage(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Set preview URL
      setPreviewUrl(response.data.image.urls.medium);

      // Call the callback with image data
      onImageUploaded(response.data.image);

      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      await uploadFile(file);
    },
    [disabled, localAltText]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      await uploadFile(file);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [localAltText]
  );

  const handleBrowseClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded(null);
  };

  const handleAltTextChange = (value: string) => {
    setLocalAltText(value);
    if (onAltTextChange) {
      onAltTextChange(value);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alt Text Input */}
      <div>
        <Label htmlFor="altText">
          Alt Text <span className="text-red-500">*</span>
        </Label>
        <Input
          id="altText"
          placeholder="Describe the image for accessibility..."
          value={localAltText}
          onChange={(e) => handleAltTextChange(e.target.value)}
          disabled={disabled}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Required for accessibility. Describe what's in the image.
        </p>
      </div>

      {/* Upload Area */}
      {!previewUrl ? (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4">
            {isUploading ? (
              <div className="w-full max-w-xs space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  Uploading and processing image...
                </p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drag & Drop your files or Browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports JPEG, PNG, and WebP up to 5MB
                  </p>
                  <Button type="button" variant="outline" disabled={disabled}>
                    Browse Files
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Image Preview */
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <LazyImage
                src={previewUrl}
                alt={localAltText || 'Uploaded image'}
                className="w-full h-48 object-cover rounded-lg"
                useIntersectionObserver={false} // Don't lazy load preview images
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-start gap-2">
              <ImageIcon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Image uploaded successfully
                </p>
                <p className="text-xs text-gray-500">
                  Alt text: {localAltText || 'No alt text provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Validation Message */}
      {!localAltText.trim() && (
        <div className="flex items-center gap-2 text-amber-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Alt text is required before uploading</span>
        </div>
      )}
    </div>
  );
};