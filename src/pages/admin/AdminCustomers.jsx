import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      // First get customers
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) {
        console.error(customersError);
        setLoading(false);
        return;
      }

      // Then get order counts for each customer
      const customersWithCounts = await Promise.all(
        (customersData || []).map(async (customer) => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', customer.id);
          return { ...customer, orders: [{ count: count || 0 }] };
        })
      );

      setCustomers(customersWithCounts);
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