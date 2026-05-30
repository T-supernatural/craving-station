import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../lib/authApi';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const lastChecked = useRef(null);

  useEffect(() => {
    if (!user?.id && !user?.email) {
      setIsAdmin(false);
      return;
    }

    const userKey = user?.id || user?.email;
    if (lastChecked.current === userKey) return;
    lastChecked.current = userKey;

    const checkAdminStatus = async () => {
      console.log('AdminRoute: Checking admin status for user:', userKey);

      const djangoUser = authApi.tokenManager.getStoredUser();
      if (djangoUser && (djangoUser.role === 'admin' || djangoUser.is_staff || djangoUser.is_superuser)) {
        console.log('AdminRoute: User is admin (Django)');
        setIsAdmin(true);
        return;
      }

      if (user && (user.role === 'admin' || user.is_staff || user.is_superuser)) {
        console.log('AdminRoute: User is admin (AuthContext)');
        setIsAdmin(true);
      } else {
        console.log('AdminRoute: User is not admin');
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user?.id, user?.email]);

  if (loading || isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}