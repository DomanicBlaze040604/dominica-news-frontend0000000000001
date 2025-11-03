import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Menu,
  X,
  Home,
  LogOut,
  User,
  AlertTriangle,
  Globe,
} from 'lucide-react';

const adminNavItems = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Articles',
    path: '/admin/articles',
    icon: FileText,
  },
  {
    label: 'Categories',
    path: '/admin/categories',
    icon: FolderOpen,
  },
  {
    label: 'Authors',
    path: '/admin/authors',
    icon: User,
  },
  {
    label: 'Pages',
    path: '/admin/pages',
    icon: Globe,
  },
  {
    label: 'Breaking News',
    path: '/admin/breaking-news',
    icon: AlertTriangle,
  },
  {
    label: 'Images',
    path: '/admin/images',
    icon: Image,
  },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-primary">DOMINICA NEWS</h1>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t space-y-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-start"
            >
              <Link to="/">
                <Home className="mr-3 h-4 w-4" />
                Back to Site
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - compact */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="flex items-center px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden mr-3"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500">
                Manage your news content
              </p>
            </div>
          </div>
        </div>

        {/* Page content - minimal padding */}
        <main className="p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};