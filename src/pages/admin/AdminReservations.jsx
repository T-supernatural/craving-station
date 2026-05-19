import { useEffect, useState } from 'react';
import { fetchReservations, updateReservationStatus } from '../../lib/reservationsApi';
import { createNotification } from '../../lib/notificationsApi';
import toast from 'react-hot-toast';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelNotes, setCancelNotes] = useState('');

  useEffect(() => {
    fetchReservationsList();
  }, [filter]);

  const fetchReservationsList = async () => {
    setLoading(true);
    try {
      const data = await fetchReservations({ status: filter !== 'all' ? filter : undefined });
      setReservations(data || []);
    } catch (error) {
      console.error('Failed to load reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (reservation, newStatus, notes = '') => {
    if (!reservation.user_id) return; // Skip notifications for guest reservations

    let title = '';
    let message = '';

    if (newStatus === 'confirmed') {
      title = 'Booking Confirmed ✅';
      message = `Your booking for ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time} for ${reservation.guests} guest(s) has been confirmed. We look forward to supporting your event at Craving Station.`;
    } else if (newStatus === 'cancelled') {
      title = 'Reservation Update ❌';
      message = `Your reservation for ${new Date(reservation.date).toLocaleDateString()} at ${reservation.time} has been cancelled.`;
      if (notes) {
        message += ` Reason: ${notes}`;
      }
      message += ' Please contact us or make a new reservation. We apologize for any inconvenience.';
    }

    if (title && message) {
      try {
        await createNotification({
          user_id: reservation.user_id,
          title,
          message,
          type: 'reservation',
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }
  };

  const updateStatus = async (id, status, notes = '') => {
    try {
      await updateReservationStatus(id, status, notes);

      const reservation = reservations.find((r) => r.id === id);
      if (reservation) {
        await sendNotification(reservation, status, notes);
      }

      toast.success('Status updated');
      fetchReservationsList();
      setCancellingId(null);
      setCancelNotes('');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === 'cancelled') {
      setCancellingId(id);
    } else {
      updateStatus(id, newStatus);
    }
  };

  const confirmCancellation = () => {
    if (cancellingId) {
      updateStatus(cancellingId, 'cancelled', cancelNotes);
    }
  };

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">Reservations Management</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white">
          <option value="all">All Reservations</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="glass-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-yakoyo-surface2">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Guests</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((res) => (
              <tr key={res.id} className="border-t border-white/10">
                <td className="px-4 py-3">{res.name}</td>
                <td className="px-4 py-3">{res.email}</td>
                <td className="px-4 py-3">{new Date(res.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{res.time}</td>
                <td className="px-4 py-3">{res.guests}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${res.status === 'confirmed' ? 'bg-green-600' : res.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                    {res.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={res.status}
                    onChange={(e) => handleStatusChange(res.id, e.target.value)}
                    className="rounded border border-white/20 bg-yakoyo-surface px-2 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cancellation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-serif mb-4">Cancel Reservation</h3>
            <p className="text-yakoyo-muted mb-4">
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Reason for cancellation (optional — will be shown to customer)
              </label>
              <textarea
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="e.g., Restaurant is fully booked, technical issues, etc."
                className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white h-20 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setCancellingId(null); setCancelNotes(''); }}
                className="flex-1 rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10"
              >
                Keep Reservation
              </button>
              <button
                onClick={confirmCancellation}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
              >
                Cancel Reservation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}