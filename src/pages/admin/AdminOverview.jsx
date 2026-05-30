import { useEffect, useState } from 'react';
import authApi from '../../lib/authApi';
import StatsCard from '../../components/admin/StatsCard';
import { formatNaira } from '../../utils/formatNaira';
import { useDeliveryFee } from '../../hooks/useDeliveryFee';

export default function AdminOverview() {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const { deliveryFee } = useDeliveryFee();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = await authApi.getAuthHeader();
        const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
        const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;
        const res = await fetch(`${API_BASE_URL}/admin/stats/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(headers || {}) },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch admin stats: ${res.status}`);
        }

        const data = await res.json();

        setStats({
          ordersToday: data.ordersToday || 0,
          revenueToday: data.revenueToday || 0,
          pendingReservations: data.pendingReservations || 0,
          totalCustomers: data.totalCustomers || 0,
        });
        setRecentOrders(data.recentOrders || []);
        setRecentReservations(data.recentReservations || []);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          ordersToday: 0,
          revenueToday: 0,
          pendingReservations: 0,
          totalCustomers: 0,
        });
        setRecentOrders([]);
        setRecentReservations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif">Dashboard Overview</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Orders Today" value={stats.ordersToday} />
        <StatsCard title="Revenue Today" value={formatNaira(stats.revenueToday)} />
        <StatsCard title="Pending Reservations" value={stats.pendingReservations} />
        <StatsCard title="Total Customers" value={stats.totalCustomers} />
        <StatsCard title="Delivery Fee" value={formatNaira(deliveryFee)} />
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b border-white/10">
                <div>
                  <p className="font-semibold">#{String(order.id).slice(-8)}</p>
                  <p className="text-sm text-yakoyo-muted">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatNaira(order.total)}</p>
                  <p className={`text-xs px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Reservations</h2>
          <div className="space-y-3">
            {recentReservations.map((res) => (
              <div key={res.id} className="flex justify-between items-center py-2 border-b border-white/10">
                <div>
                  <p className="font-semibold">{res.name}</p>
                  <p className="text-sm text-yakoyo-muted">{new Date(res.date).toLocaleDateString()} {res.time}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs px-2 py-1 rounded ${res.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'}`}>
                    {res.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}