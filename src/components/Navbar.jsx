import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signOut, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const lastCheckedId = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(user.role === 'admin');
  }, [user?.id, user?.role]);

  const getGuestLinks = () => [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Bakery Collection' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/reservations', label: 'Catering' },
    { path: '/order', label: 'Bakery Order' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' }
  ];

  const getCustomerLinks = () => [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Bakery Collection' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/reservations', label: 'Catering' },
    { path: '/order', label: 'Bakery Order' }
  ];

  const getAdminLinks = () => [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/reservations', label: 'Reservations' },
    { path: '/admin', label: 'Admin Panel' }
  ];

  const getCurrentLinks = () => {
    if (!user) return getGuestLinks();
    if (isAdmin) return getAdminLinks();
    return getCustomerLinks();
  };

  const getUserInitial = () => {
    if (!user?.user_metadata?.full_name) return '?';
    return user.user_metadata.full_name.charAt(0).toUpperCase();
  };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? 'bg-yakoyo-surface/90 backdrop-blur-lg' : 'bg-transparent'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm md:px-8">
        <Link to="/" className="text-3xl font-bold font-serif tracking-tight text-yakoyo-accent">
          Craving <span className="text-white font-normal text-2xl">Station</span>
        </Link>

        <div className="md:hidden">
          <button onClick={() => setOpen((v) => !v)} aria-label="menu" className="rounded border border-white/25 p-2 text-white">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <ul className={`absolute left-0 right-0 top-full z-40 bg-yakoyo-surface/95 p-4 backdrop-blur-lg transition-all md:static md:flex md:items-center md:bg-transparent md:p-0 ${open ? 'block' : 'hidden md:block'}`}>
          {getCurrentLinks().map((item) => (
            <li key={item.path} className="mx-0 mb-2 md:mx-3 md:mb-0">
              <Link
                to={item.path}
                onClick={() => setOpen(false)}
                className={`block rounded px-3 py-2 transition ${location.pathname === item.path ? 'text-yakoyo-accent' : 'text-white hover:text-yakoyo-accent'}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {user && (
            <li className="relative mx-0 mb-2 md:mx-3 md:mb-0">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full bg-yakoyo-accent p-2 text-black hover:bg-yakoyo-accent/80"
                aria-label="User menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold">
                  {getUserInitial()}
                </div>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-yakoyo-surface border border-white/20 py-2 shadow-lg" role="menu">
                  {!isAdmin && (
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-white hover:bg-yakoyo-surface2"
                      role="menuitem"
                    >
                      My Account
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-white hover:bg-yakoyo-surface2"
                      role="menuitem"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-yakoyo-surface2"
                    role="menuitem"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
