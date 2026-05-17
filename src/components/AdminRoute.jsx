import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const lastChecked = useRef(null);

  useEffect(() => {
    if (!user?.id || lastChecked.current === user.id) return;
    lastChecked.current = user.id;
    console.log('AdminRoute: Checking admin status for user:', user.id);
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('AdminRoute: Error fetching profile:', error);
          setIsAdmin(false);
        } else {
          console.log('AdminRoute: User role:', data.role);
          setIsAdmin(data.role === 'admin');
        }
      });
  }, [user?.id]);

  if (loading || isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}