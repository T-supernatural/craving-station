import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import ReservationForm from '../components/ReservationForm';

export default function Reservations() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const { error } = await supabase.from('reservations').insert([
      {
        name: values.name,
        email: values.email,
        phone: values.phone,
        date: values.date,
        time: values.time,
        guests: values.guests,
        special_requests: values.special_requests
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      toast.error('Could not place booking.');
      return;
    }

    toast.success('Catering request submitted! We will follow up shortly.');
  };

  return (
    <section className="mx-auto max-w-5xl p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-serif">Book Catering Service</h1>
        <p className="mt-2 text-yakoyo-muted">Request a bakery or catering package for your event, celebration, or special order.</p>
      </div>
      <ReservationForm onSubmit={onSubmit} />
      {isSubmitting && <p className="mt-4 text-yakoyo-muted">Saving reservation...</p>}
    </section>
  );
}
