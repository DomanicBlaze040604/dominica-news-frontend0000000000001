import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { breakingNewsService } from '../../services/breakingNews';
import { BreakingNews, BreakingNewsFormData } from '../../types/api';
import { useToast } from '@/hooks/use-toast';

export const AdminBreakingNews: React.FC = () => {
  const [breakingNews, setBreakingNews] = useState<BreakingNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BreakingNewsFormData>({
    text: '',
    isActive: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  const fetchBreakingNews = async () => {
    try {
      setLoading(true);
      const response = await breakingNewsService.getAll();
      setBreakingNews(response.breakingNews || []);
    } catch (error) {
      console.error('Error fetching breaking news:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch breaking news',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      toast({
        title: 'Error',
        description: 'Breaking news text is required',
        variant: 'destructive',
      });
      return;
    }

    if (formData.text.length > 200) {
      toast({
        title: 'Error',
        description: 'Breaking news text cannot exceed 200 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingId) {
        await breakingNewsService.update(editingId, formData);
        toast({
          title: 'Success',
          description: 'Breaking news updated successfully',
        });
      } else {
        await breakingNewsService.create(formData);
        toast({
          title: 'Success',
          description: 'Breaking news created successfully',
        });
      }
      
      resetForm();
      fetchBreakingNews();
    } catch (error) {
      console.error('Error saving breaking news:', error);
      toast({
        title: 'Error',
        description: 'Failed to save breaking news',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (news: BreakingNews) => {
    setFormData({
      text: news.text,
      isActive: news.isActive,
    });
    setEditingId(news.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this breaking news?')) {
      return;
    }

    try {
      await breakingNewsService.delete(id);
      toast({
        title: 'Success',
        description: 'Breaking news deactivated successfully',
      });
      fetchBreakingNews();
    } catch (error) {
      console.error('Error deleting breaking news:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate breaking news',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({ text: '', isActive: false });
    setEditingId(null);
    setShowForm(false);
  };

  const characterCount = formData.text.length;
  const isOverLimit = characterCount > 200;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Breaking News Management</h1>
          <p className="text-gray-600">Manage breaking news alerts and notifications</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Breaking News
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {editingId ? 'Edit Breaking News' : 'Add Breaking News'}
            </CardTitle>
            <CardDescription>
              Create or update breaking news alerts. Only one breaking news can be active at a time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Breaking News Text</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter breaking news text..."
                  className={`min-h-[100px] ${isOverLimit ? 'border-red-500' : ''}`}
                  maxLength={250}
                />
                <div className="flex justify-between text-sm">
                  <span className={`${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                    {characterCount}/200 characters
                  </span>
                  {isOverLimit && (
                    <span className="text-red-500">Character limit exceeded</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Make this breaking news active</Label>
              </div>

              {formData.isActive && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Activating this breaking news will automatically deactivate any other active breaking news.
                  </p>
                </div>
              )}

              {/* Preview */}
              {formData.text && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="p-3 bg-red-600 text-white rounded-md">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        BREAKING
                      </Badge>
                      <span className="text-sm">{formData.text}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting || !formData.text.trim() || isOverLimit}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Breaking News List */}
      <Card>
        <CardHeader>
          <CardTitle>Breaking News History</CardTitle>
          <CardDescription>
            All breaking news entries, including active and inactive ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {breakingNews.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No breaking news</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first breaking news alert.</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Breaking News
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {breakingNews.map((news) => (
                <div
                  key={news.id}
                  className={`p-4 border rounded-lg ${
                    news.isActive ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={news.isActive ? 'destructive' : 'secondary'}
                        >
                          {news.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Created {new Date(news.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-900 mb-2">{news.text}</p>
                      <p className="text-sm text-gray-600">
                        Created by: {news.createdBy.fullName}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(news)}
                        className="flex items-center gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(news.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                        Deactivate
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};