import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IdeaFile } from '@/types';
import { useIdeaFiles } from '@/hooks/useIdeaFiles';
import { useAuth } from '@/contexts/AuthContext';
import { Paperclip, Trash2, Loader2, FileText, Image, File } from 'lucide-react';

interface IdeaFileManagerProps {
  ideaId: string;
  readOnly?: boolean;
}

function getFileIcon(fileType: string | null) {
  if (fileType?.startsWith('image/')) return Image;
  if (fileType?.includes('pdf') || fileType?.includes('document')) return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(0)}KB`;
}

export function IdeaFileManager({ ideaId, readOnly = false }: IdeaFileManagerProps) {
  const { user } = useAuth();
  const { getIdeaFiles, uploadFile, deleteFile, getFileUrl, uploading } = useIdeaFiles(user?.id);
  const [files, setFiles] = useState<IdeaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    getIdeaFiles(ideaId).then(setFiles);
  }, [ideaId, getIdeaFiles]);

  const processFiles = async (fileList: FileList | File[]) => {
    for (const file of Array.from(fileList)) {
      const uploaded = await uploadFile(ideaId, file);
      if (uploaded) setFiles(prev => [uploaded, ...prev]);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    await processFiles(selectedFiles);
    e.target.value = '';
  };

  const handleDelete = async (file: IdeaFile) => {
    await deleteFile(file.id, file.file_path);
    setFiles(prev => prev.filter(f => f.id !== file.id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (readOnly || uploading || !e.dataTransfer.files.length) return;
    await processFiles(e.dataTransfer.files);
  };

  return (
    <div
      className="space-y-2"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="border-2 border-dashed border-primary/50 rounded-lg p-4 text-center text-sm text-primary/70 bg-primary/5 animate-pulse">
          Drop files here to attach
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Attachments {files.length > 0 && `(${files.length})`}
        </span>
        {!readOnly && (
          <label>
            <input type="file" className="hidden" onChange={handleUpload} multiple disabled={uploading} />
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1 cursor-pointer" asChild disabled={uploading}>
              <span>
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
                Attach
              </span>
            </Button>
          </label>
        )}
      </div>
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map(file => {
            const Icon = getFileIcon(file.file_type);
            return (
              <div key={file.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-md bg-muted/50 group">
                <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <a
                  href={getFileUrl(file.file_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {file.file_name}
                </a>
                <span className="text-xs text-muted-foreground">{formatSize(file.file_size)}</span>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
