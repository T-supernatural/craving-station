import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import ProfileTab from '../components/dashboard/ProfileTab';
import OrderHistoryTab from '../components/dashboard/OrderHistoryTab';
import ReservationsTab from '../components/dashboard/ReservationsTab';

const tabs = [
  { id: 'profile', label: 'Profile', component: ProfileTab },
  { id: 'orders', label: 'Order History', component: OrderHistoryTab },
  { id: 'reservations', label: 'Reservations', component: ReservationsTab },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          // If profile doesn't exist, create one
          if (profileError.code === 'PGRST116') {
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || null,
                phone: user.user_metadata?.phone || null,
              })
              .select()
              .single();

            if (createError) throw createError;
            setProfile(newProfile);
          } else {
            throw profileError;
          }
        } else {
          setProfile(profileData);

          // Check if user is admin and redirect to admin dashboard
          if (profileData?.role === 'admin') {
            return <Navigate to="/admin" replace />;
          }
        }

        // Fetch order count
        const { count, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) throw countError;
        setOrderCount(count || 0);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const getGreeting = () => {
    if (!profile?.full_name) return 'Welcome back 👋';

    const firstName = profile.full_name.split(' ')[0];
    const now = new Date();
    // Nigerian time (WAT UTC+1)
    const nigeriaTime = new Date(now.getTime() + (1 * 60 * 60 * 1000));
    const hour = nigeriaTime.getUTCHours();

    if (hour >= 5 && hour < 12) {
      return `Good morning, ${firstName} 👋`;
    } else if (hour >= 12 && hour < 16) {
      return `Good afternoon, ${firstName} 👋`;
    } else if (hour >= 16 && hour < 21) {
      return `Good evening, ${firstName} 👋`;
    } else {
      return `Welcome back, ${firstName} 👋`;
    }
  };

  const getSubtitle = () => {
    if (orderCount > 0) {
      return `You have placed ${orderCount} order${orderCount === 1 ? '' : 's'} with us. Thank you for choosing Craving Station.`;
    } else {
      return "You haven't placed an order yet. Explore our menu and treat yourself 🍽️";
    }
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Redirect admin users to admin dashboard
  if (profile?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif mb-2">
            {loading ? 'Dashboard' : getGreeting()}
          </h1>
          {!loading && (
            <p className="text-yakoyo-muted text-lg">
              {getSubtitle()}
            </p>
          )}
        </div>
        <button onClick={signOut} className="rounded-xl bg-yakoyo-surface px-4 py-2 text-sm hover:bg-yakoyo-surface2">
          Sign Out
        </button>
      </div>

      <div className="glass-card rounded-3xl border p-6">
        <div className="mb-6 flex space-x-4 border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 text-sm font-semibold transition ${
                activeTab === tab.id ? 'border-b-2 border-yakoyo-accent text-yakoyo-accent' : 'text-yakoyo-muted hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div>
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </section>
  );
}