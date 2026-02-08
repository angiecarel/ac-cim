import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIdea } from '@/contexts/IdeaContext';
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
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ideas', label: 'Idea Bucket', icon: Lightbulb },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/systems', label: 'Log', icon: PenTool },
  { path: '/quicklinks', label: 'Quick Links', icon: Link2 },
  { path: '/history', label: 'Past Ideas', icon: History },
  { path: '/archive', label: 'Archive', icon: Archive },
  { path: '/settings', label: 'Manage', icon: Settings },
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
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

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
          {/* Logo */}
          <Link 
            to="/ideas" 
            className="flex h-16 items-center gap-3 border-b px-6 hover:bg-sidebar-accent/50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-creative">
              <Lightbulb className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-gradient">CIM</span>
          </Link>

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
          <div className="border-t p-4">
            <div className="mb-3 flex items-center gap-3 px-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                {profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium truncate">{profile?.display_name || 'User'}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start"
                onClick={toggleDarkMode}
              >
                {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {isDark ? 'Light' : 'Dark'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
