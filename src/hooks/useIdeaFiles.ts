import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { IdeaFile } from '@/types';
import { toast } from 'sonner';

export function useIdeaFiles(userId: string | undefined) {
  const [uploading, setUploading] = useState(false);

  const getIdeaFiles = useCallback(async (ideaId: string): Promise<IdeaFile[]> => {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('idea_files')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching idea files:', error);
      return [];
    }
    return (data || []) as IdeaFile[];
  }, [userId]);

  const uploadFile = useCallback(async (ideaId: string, file: File): Promise<IdeaFile | null> => {
    if (!userId) return null;
    if (file.size > 1024 * 1024) {
      toast.error('File must be under 1MB');
      return null;
    }

    setUploading(true);
    try {
      const filePath = `${userId}/${ideaId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('idea-files')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('idea_files')
        .insert({
          idea_id: ideaId,
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || null,
        })
        .select()
        .single();
      if (error) throw error;

      toast.success('File uploaded');
      return data as IdeaFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setUploading(false);
    }
  }, [userId]);

  const deleteFile = useCallback(async (fileId: string, filePath: string) => {
    try {
      await supabase.storage.from('idea-files').remove([filePath]);
      const { error } = await supabase.from('idea_files').delete().eq('id', fileId);
      if (error) throw error;
      toast.success('File deleted');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  }, []);

  const getFileUrl = useCallback((filePath: string) => {
    const { data } = supabase.storage.from('idea-files').getPublicUrl(filePath);
    return data.publicUrl;
  }, []);

  return { getIdeaFiles, uploadFile, deleteFile, getFileUrl, uploading };
}
