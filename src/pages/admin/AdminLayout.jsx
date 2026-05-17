import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, ChefHat, Package, Calendar, Users, Settings, Menu, X, User, Image } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const navItems = [
  { path: '/admin', label: 'Overview', icon: BarChart3 },
  { path: '/admin/menu', label: 'Menu', icon: ChefHat },
  { path: '/admin/orders', label: 'Orders', icon: Package },
  { path: '/admin/reservations', label: 'Reservations', icon: Calendar },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/gallery', label: 'Gallery', icon: Image },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getPageTitle = () => {
    const item = navItems.find(item => item.path === location.pathname);
    return item ? item.label : 'Admin Panel';
  };

  const getUserInitial = () => {
    if (!user?.user_metadata?.full_name) return '?';
    return user.user_metadata.full_name.charAt(0).toUpperCase();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#0d0d0d' }}>
      <div className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-serif text-yakoyo-accent">Craving Station Admin</h1>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:text-yakoyo-accent"
        >
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 space-y-2 px-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-yakoyo-accent text-black' : 'hover:bg-yakoyo-surface2'}`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-6">
        <button onClick={signOut} className="w-full text-left px-4 py-2 rounded-lg hover:bg-yakoyo-surface2">
          Sign Out
        </button>
      </div>
    </div>
  )

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  return (
    <div className="flex min-h-screen items-start bg-yakoyo-bg text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 sticky top-0 h-screen overflow-y-auto border-r border-yakoyo-surface2 flex-shrink-0" style={{ backgroundColor: '#0d0d0d' }}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer via Portal */}
      {createPortal(
        <>
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                zIndex: 9998
              }}
            />
          )}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              width: '256px',
              backgroundColor: '#0d0d0d',
              borderRight: '1px solid #1f1f1f',
              zIndex: 9999,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s ease-in-out',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {sidebarContent}
          </div>
        </>,
        document.body
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-x-hidden" style={{ backgroundColor: '#0a0a0a' }}>
        {/* Top Bar */}
        <header className="bg-yakoyo-surface border-b border-white/10 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-white hover:text-yakoyo-accent"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-serif text-white">{getPageTitle()}</h1>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-yakoyo-muted">Admin Panel</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <div className="overflow-x-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}