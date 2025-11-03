import { useState } from "react";
import { useAllSiteSettings, useUpdateSiteSetting } from "../../hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

const AdminSettings = () => {
  const { data: settingsData, isLoading } = useAllSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const [featuredLayout, setFeaturedLayout] = useState<string>('single');

  // Get current featured layout setting
  const settings = settingsData?.data?.settings || [];
  const currentLayoutSetting = settings.find(s => s.key === 'featured_section_layout');
  
  // Update local state when data loads
  useState(() => {
    if (currentLayoutSetting) {
      setFeaturedLayout(currentLayoutSetting.value);
    }
  });

  const handleLayoutChange = async (value: string) => {
    setFeaturedLayout(value);
    
    try {
      await updateSetting.mutateAsync({
        key: 'featured_section_layout',
        value,
        description: 'Layout type for the featured section on homepage'
      });
      
      toast.success('Featured section layout updated successfully');
    } catch (error) {
      console.error('Error updating layout:', error);
      toast.error('Failed to update layout setting');
      // Revert on error
      setFeaturedLayout(currentLayoutSetting?.value || 'single');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-headline font-bold text-foreground mb-2">
          Site Settings
        </h1>
        <p className="text-muted-foreground">
          Configure various site-wide settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Featured Section Layout */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline font-semibold">
              Featured Section Layout
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose how featured articles are displayed on the homepage
            </p>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={featuredLayout}
              onValueChange={handleLayoutChange}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Single Featured Article</div>
                    <div className="text-sm text-muted-foreground">
                      Display one large featured article with prominent image
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cards" id="cards" />
                <Label htmlFor="cards" className="cursor-pointer">
                  <div>
                    <div className="font-medium">Card Layout (2-3 Stories)</div>
                    <div className="text-sm text-muted-foreground">
                      Display 2-3 featured articles in a side-by-side card layout
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {updateSetting.isPending && (
              <div className="mt-4 text-sm text-muted-foreground">
                Updating layout...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-headline font-semibold">
              Other Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Additional site configuration options
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings
                .filter(setting => setting.key !== 'featured_section_layout')
                .map(setting => (
                  <div key={setting._id} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{setting.key}</div>
                      {setting.description && (
                        <div className="text-sm text-muted-foreground">{setting.description}</div>
                      )}
                    </div>
                    <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {setting.value}
                    </div>
                  </div>
                ))}
              
              {settings.filter(s => s.key !== 'featured_section_layout').length === 0 && (
                <p className="text-muted-foreground text-sm">No other settings configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;