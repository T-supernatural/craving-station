import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchUserReservations } from '../../lib/reservationsApi';

export default function ReservationsTab() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {
      if (!user) return;
      try {
        const data = await fetchUserReservations();
        setReservations(data || []);
      } catch (error) {
        console.error('Failed to fetch reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, [user]);

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <div className="space-y-4">
      {reservations.length === 0 ? (
        <p className="text-yakoyo-muted">No reservations yet.</p>
      ) : (
        reservations.map(reservation => (
          <div key={reservation.id} className="rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Reservation #{reservation.id.slice(-8)}</span>
              <span className={`text-xs px-2 py-1 rounded ${reservation.status === 'confirmed' ? 'bg-green-600' : reservation.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'}`}>
                {reservation.status}
              </span>
            </div>
            <p className="text-sm text-yakoyo-muted mb-1">
              {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
            </p>
            <p className="text-sm mb-1">Guests: {reservation.guests}</p>
            {reservation.special_requests && (
              <p className="text-sm">Requests: {reservation.special_requests}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}