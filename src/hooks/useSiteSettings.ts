import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siteSettingsService, SiteSetting } from '../services/siteSettings';

export const useSiteSetting = (key: string) => {
  return useQuery({
    queryKey: ['site-setting', key],
    queryFn: () => siteSettingsService.getSetting(key),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllSiteSettings = () => {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: () => siteSettingsService.getAllSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: string; description?: string }) =>
      siteSettingsService.updateSetting(key, value, description),
    onSuccess: (data, variables) => {
      // Invalidate and refetch the specific setting
      queryClient.invalidateQueries({ queryKey: ['site-setting', variables.key] });
      // Invalidate all settings query
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};

export const useDeleteSiteSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => siteSettingsService.deleteSetting(key),
    onSuccess: (data, key) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['site-setting', key] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};