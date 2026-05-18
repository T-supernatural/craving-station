import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../lib/authApi';
import { supabase } from '../lib/supabaseClient';

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

      // Check Django stored user first (highest priority)
      const djangoUser = authApi.tokenManager.getStoredUser();
      if (djangoUser?.role === 'admin') {
        console.log('AdminRoute: User is admin (Django)');
        setIsAdmin(true);
        return;
      }

      // Fall back to Supabase profile check
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn('AdminRoute: Error fetching Supabase profile:', error);
          setIsAdmin(false);
          return;
        }

        const isAdminRole = data?.role === 'admin';
        console.log('AdminRoute: User role (Supabase):', data?.role, 'isAdmin:', isAdminRole);
        setIsAdmin(isAdminRole);
      } catch (error) {
        console.error('AdminRoute: Unexpected error checking admin status:', error);
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