import { useEffect, useState } from 'react';
import authApi from '../../lib/authApi';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      // Fetch customers from Django API
      try {
        const headers = await authApi.getAuthHeader();
        const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
        const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;
        const res = await fetch(`${API_BASE_URL}/admin/users/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(headers || {}) },
        });

        if (!res.ok) {
          console.error('Failed to fetch customers', res.status);
          setLoading(false);
          return;
        }

        const customersData = await res.json();
        const customersError = null;

        // Map API response to existing expected shape
        const customersWithCounts = (customersData || []).map((customer) => ({
          ...customer,
          orders: [{ count: customer.order_count || 0 }],
        }));

        setCustomers(customersWithCounts);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    fetchCustomers();
  }, []);

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif">Customers</h1>

      <div className="glass-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-yakoyo-surface2">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Orders</th>
              <th className="px-4 py-3 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-white/10">
                <td className="px-4 py-3">{customer.full_name}</td>
                <td className="px-4 py-3">{customer.email}</td>
                <td className="px-4 py-3">{customer.phone}</td>
                <td className="px-4 py-3">{customer.orders?.[0]?.count || 0}</td>
                <td className="px-4 py-3">{new Date(customer.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}