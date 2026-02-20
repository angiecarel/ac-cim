import React, { createContext, useContext, useState, useCallback } from 'react';
import { Idea, ContentType, Platform, QuickLink, Tag, IdeaFilters, IdeaStats, ViewMode } from '@/types';
import { useIdeas } from '@/hooks/useIdeas';
import { useContentTypes } from '@/hooks/useContentTypes';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useQuickLinks } from '@/hooks/useQuickLinks';
import { useTags, useIdeaTags } from '@/hooks/useTags';
import { useAuth } from './AuthContext';

interface IdeaContextType {
  // Ideas
  ideas: Idea[];
  ideasLoading: boolean;
  createIdea: (idea: Partial<Idea>) => Promise<Idea | null>;
  updateIdea: (id: string, updates: Partial<Idea>) => Promise<void>;
  deleteIdea: (id: string) => Promise<void>;
  duplicateIdea: (idea: Idea) => Promise<Idea | null>;
  archiveIdea: (id: string) => Promise<void>;
  restoreIdea: (id: string) => Promise<void>;
  recycleIdea: (id: string) => Promise<void>;
  
  // Content Types
  contentTypes: ContentType[];
  contentTypesLoading: boolean;
  createContentType: (name: string) => Promise<void>;
  updateContentType: (id: string, name: string) => Promise<void>;
  deleteContentType: (id: string) => Promise<void>;
  
  // Platforms
  platforms: Platform[];
  platformsLoading: boolean;
  createPlatform: (name: string) => Promise<void>;
  updatePlatform: (id: string, name: string) => Promise<void>;
  deletePlatform: (id: string) => Promise<void>;
  
  // QuickLinks
  quickLinks: QuickLink[];
  quickLinksLoading: boolean;
  createQuickLink: (name: string, url: string, contentTypeId?: string | null, linkType?: string | null) => Promise<void>;
  updateQuickLink: (id: string, name: string, url: string, contentTypeId?: string | null, linkType?: string | null) => Promise<void>;
  deleteQuickLink: (id: string) => Promise<void>;
  
  // Tags
  tags: Tag[];
  tagsLoading: boolean;
  createTag: (name: string, color?: string) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<void>;
  getIdeaTags: (ideaId: string) => Promise<string[]>;
  setIdeaTags: (ideaId: string, tagIds: string[]) => Promise<void>;
  
  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: IdeaFilters;
  setFilters: (filters: IdeaFilters) => void;
  clearFilters: () => void;
  
  // Stats
  stats: IdeaStats;
  
  // Filtered ideas
  filteredIdeas: Idea[];
  timelyIdeas: Idea[];
  nonTimelyIdeas: Idea[];
}

const IdeaContext = createContext<IdeaContextType | undefined>(undefined);

export function IdeaProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<IdeaFilters>({});
  
  // Hooks for data
  const {
    ideas,
    loading: ideasLoading,
    createIdea,
    updateIdea,
    deleteIdea,
  } = useIdeas(user?.id);
  
  const {
    contentTypes,
    loading: contentTypesLoading,
    createContentType,
    updateContentType,
    deleteContentType,
  } = useContentTypes(user?.id);
  
  const {
    platforms,
    loading: platformsLoading,
    createPlatform,
    updatePlatform,
    deletePlatform,
  } = usePlatforms(user?.id);
  
  const {
    quickLinks,
    loading: quickLinksLoading,
    createQuickLink,
    updateQuickLink,
    deleteQuickLink,
  } = useQuickLinks(user?.id);

  const {
    tags,
    loading: tagsLoading,
    createTag,
    deleteTag,
  } = useTags(user?.id);

  const { getIdeaTags, setIdeaTags } = useIdeaTags(user?.id);
  
  // Archive/Restore/Recycle/Duplicate helpers
  const archiveIdea = useCallback(async (id: string) => {
    await updateIdea(id, { status: 'archived', scheduled_date: null });
  }, [updateIdea]);
  
  const restoreIdea = useCallback(async (id: string) => {
    await updateIdea(id, { status: 'developing' });
  }, [updateIdea]);
  
  const recycleIdea = useCallback(async (id: string) => {
    await updateIdea(id, { status: 'recycled', scheduled_date: null });
  }, [updateIdea]);

  const duplicateIdea = useCallback(async (idea: Idea): Promise<Idea | null> => {
    const newIdea = await createIdea({
      title: `${idea.title} (Copy)`,
      description: idea.description,
      content: idea.content,
      content_type_id: idea.content_type_id,
      platform_id: idea.platform_id,
      priority: idea.priority,
      status: 'developing',
      is_timely: false,
      source: idea.source,
      next_action: idea.next_action,
      energy_level: idea.energy_level,
      time_estimate: idea.time_estimate,
    });
    
    // Copy tags if new idea was created
    if (newIdea) {
      const tagIds = await getIdeaTags(idea.id);
      if (tagIds.length > 0) {
        await setIdeaTags(newIdea.id, tagIds);
      }
    }
    
    return newIdea;
  }, [createIdea, getIdeaTags, setIdeaTags]);
  
  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Calculate stats
  const stats: IdeaStats = {
    total: ideas.length,
    byStatus: {
      hold: ideas.filter(i => i.status === 'hold').length,
      developing: ideas.filter(i => i.status === 'developing').length,
      ready: ideas.filter(i => i.status === 'ready').length,
      scheduled: ideas.filter(i => i.status === 'scheduled').length,
      archived: ideas.filter(i => i.status === 'archived').length,
      recycled: ideas.filter(i => i.status === 'recycled').length,
    },
    timely: ideas.filter(i => i.is_timely && !['archived', 'recycled'].includes(i.status)).length,
  };
  
  // Filter ideas
  const filteredIdeas = ideas.filter(idea => {
    // Exclude archived and recycled from main views unless explicitly filtering
    if (!filters.status?.length && ['archived', 'recycled'].includes(idea.status)) {
      return false;
    }
    
    if (filters.status?.length && !filters.status.includes(idea.status)) {
      return false;
    }
    
    if (filters.contentType?.length && !filters.contentType.includes(idea.content_type_id || '')) {
      return false;
    }
    
    if (filters.platform?.length && !filters.platform.includes(idea.platform_id || '')) {
      return false;
    }
    
    if (filters.priority?.length && !filters.priority.includes(idea.priority)) {
      return false;
    }
    
    if (filters.energyLevel?.length && (!idea.energy_level || !filters.energyLevel.includes(idea.energy_level))) {
      return false;
    }
    
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const ideaDate = new Date(idea.created_at);
      if (filters.dateRange.from && ideaDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && ideaDate > filters.dateRange.to) return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesTitle = idea.title.toLowerCase().includes(searchLower);
      const matchesDesc = idea.description?.toLowerCase().includes(searchLower);
      if (!matchesTitle && !matchesDesc) return false;
    }
    
    return true;
  });
  
  // Separate timely and non-timely ideas
  const timelyIdeas = filteredIdeas.filter(i => i.is_timely);
  const nonTimelyIdeasRaw = filteredIdeas.filter(i => !i.is_timely);

  // Pin "best" priority ideas to the top
  const nonTimelyIdeas = [
    ...nonTimelyIdeasRaw.filter(i => i.priority === 'best'),
    ...nonTimelyIdeasRaw.filter(i => i.priority !== 'best'),
  ];
  
  return (
    <IdeaContext.Provider
      value={{
        ideas,
        ideasLoading,
        createIdea,
        updateIdea,
        deleteIdea,
        duplicateIdea,
        archiveIdea,
        restoreIdea,
        recycleIdea,
        contentTypes,
        contentTypesLoading,
        createContentType,
        updateContentType,
        deleteContentType,
        platforms,
        platformsLoading,
        createPlatform,
        updatePlatform,
        deletePlatform,
        quickLinks,
        quickLinksLoading,
        createQuickLink,
        updateQuickLink,
        deleteQuickLink,
        tags,
        tagsLoading,
        createTag,
        deleteTag,
        getIdeaTags,
        setIdeaTags,
        viewMode,
        setViewMode,
        filters,
        setFilters,
        clearFilters,
        stats,
        filteredIdeas,
        timelyIdeas,
        nonTimelyIdeas,
      }}
    >
      {children}
    </IdeaContext.Provider>
  );
}

export function useIdea() {
  const context = useContext(IdeaContext);
  if (context === undefined) {
    throw new Error('useIdea must be used within an IdeaProvider');
  }
  return context;
}
