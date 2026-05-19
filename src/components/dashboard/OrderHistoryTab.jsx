import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserOrders } from '../../lib/ordersApi';
import { formatNaira } from '../../utils/formatNaira';

export default function OrderHistoryTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) return;
      try {
        const data = await fetchUserOrders();
        setOrders(data || []);
      } catch (error) {
        console.error('Failed to fetch order history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user]);

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-yakoyo-muted">No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Order #{order.id.slice(-8)}</span>
              <span className={`text-xs px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-600' : order.status === 'pending' ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-yakoyo-muted mb-1">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm mb-2">
              Items: {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
            </p>
            <p className="font-semibold">{formatNaira(order.total)}</p>
          </div>
        ))
      )}
    </div>
  );
}