import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIdea } from '@/contexts/IdeaContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Lightbulb,
  Calendar,
  History,
  Archive,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  PenTool,
  Briefcase,
  Link2,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ideas', label: 'Idea Bucket', icon: Lightbulb },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/log/creative', label: 'Creative Log', icon: PenTool },
  { path: '/log/business', label: 'Business Log', icon: Briefcase },
  { path: '/resources', label: 'Resources', icon: FolderOpen },
  { path: '/quicklinks', label: 'Quick Links', icon: Link2 },
  { path: '/history', label: 'Past Ideas', icon: History },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { stats } = useIdea();
  const [isDark, setIsDark] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <>
      {/* Mobile menu button - only show when sidebar is closed */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar transition-transform duration-300',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo + close button row */}
          <div className="flex h-16 items-center border-b">
            {/* Close button for mobile - inside sidebar, before logo */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 md:hidden h-8 w-8 shrink-0"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Link 
              to="/ideas" 
              className="flex flex-1 items-center gap-3 px-4 h-full hover:bg-sidebar-accent/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-creative shrink-0">
                <Lightbulb className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gradient leading-tight">CIM</span>
                <span className="text-xs text-muted-foreground leading-tight">Creative Idea Manager</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.path === '/ideas' && stats.total > 0 && (
                    <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {stats.total - stats.byStatus.archived - stats.byStatus.recycled}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                {profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate">{profile?.display_name || 'User'}</span>
                <span className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/archive"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md transition-colors',
                      location.pathname === '/archive'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <Archive className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">Archive</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md transition-colors',
                      location.pathname === '/settings'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top">Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleDarkMode}
                    className="flex h-9 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">{isDark ? 'Light mode' : 'Dark mode'}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={signOut}
                    className="flex h-9 items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Sign out</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}