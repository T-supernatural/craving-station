import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../lib/authApi';
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
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (user?.role === 'admin' || user?.is_staff || user?.is_superuser) {
        setLoading(false);
        return;
      }

      try {
        const headers = await authApi.getAuthHeader();
        const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
        const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;
        const res = await fetch(`${API_BASE_URL}/orders/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(headers || {}) },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch orders: ${res.status}`);
        }

        const orders = await res.json();
        setOrderCount(Array.isArray(orders) ? orders.length : 0);
      } catch (error) {
        console.error('Error fetching order count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderCount();
  }, [user]);

  const getGreeting = () => {
    const fullName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'friend';
    const firstName = fullName.split(' ')[0];
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
      return `You have placed ${orderCount} order${orderCount === 1 ? '' : 's'} with us. Thank you for choosing Johjay Foods.`;
    } else {
      return "You haven't placed an order yet. Explore our menu and treat yourself 🍽️";
    }
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Redirect admin users to admin dashboard
  if (user?.role === 'admin' || user?.is_staff || user?.is_superuser) {
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