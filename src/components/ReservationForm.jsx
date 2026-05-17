import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  date: z.string().min(1, 'Choose a date'),
  time: z.enum(['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '18:00', '19:00', '20:00', '21:00', '22:00']),
  guests: z.number().min(1).max(20),
  special_requests: z.string().max(300).optional()
});

export default function ReservationForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { guests: 2, time: '18:00' }
  });

  return (
    <motion.form
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit(onSubmit)}
      className="glass-card rounded-3xl border p-8 text-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block font-semibold text-yakoyo-muted">Name</label>
          <input className="mt-1 w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('name')} />
          <p className="text-xs text-red-400">{errors.name?.message}</p>
        </div>
        <div>
          <label className="block font-semibold text-yakoyo-muted">Email</label>
          <input className="mt-1 w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('email')} />
          <p className="text-xs text-red-400">{errors.email?.message}</p>
        </div>
        <div>
          <label className="block font-semibold text-yakoyo-muted">Phone</label>
          <input className="mt-1 w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('phone')} />
          <p className="text-xs text-red-400">{errors.phone?.message}</p>
        </div>
        <div>
          <label className="block font-semibold text-yakoyo-muted">Date</label>
          <input type="date" className="mt-1 w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('date')} min={new Date().toISOString().split('T')[0]} />
          <p className="text-xs text-red-400">{errors.date?.message}</p>
        </div>
        <div>
          <label className="block font-semibold text-yakoyo-muted">Time</label>
          <select className="mt-1 w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('time')}>
            <optgroup label="Breakfast">
              <option value="08:00">08:00</option>
              <option value="09:00">09:00</option>
              <option value="10:00">10:00</option>
              <option value="11:00">11:00</option>
            </optgroup>
            <optgroup label="Lunch">
              <option value="12:00">12:00</option>
              <option value="13:00">13:00</option>
              <option value="14:00">14:00</option>
              <option value="15:00">15:00</option>
            </optgroup>
            <optgroup label="Dinner">
              <option value="18:00">18:00</option>
              <option value="19:00">19:00</option>
              <option value="20:00">20:00</option>
              <option value="21:00">21:00</option>
              <option value="22:00">22:00</option>
            </optgroup>
          </select>
          <p className="text-xs text-red-400">{errors.time?.message}</p>
        </div>
        <div>
          <label className="block font-semibold text-yakoyo-muted">Guests</label>
          <input type="number" min="1" max="20" className="mt-1 w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('guests', { valueAsNumber: true })} />
          <p className="text-xs text-red-400">{errors.guests?.message}</p>
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-yakoyo-muted">Special Requests</label>
          <textarea rows="3" className="mt-1 w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('special_requests')} />
          <p className="text-xs text-red-400">{errors.special_requests?.message}</p>
        </div>
      </div>
      <button type="submit" disabled={isSubmitting} className="mt-5 w-full rounded-xl bg-yakoyo-accent px-5 py-2 font-bold text-black transition hover:shadow-glow disabled:opacity-50">
        {isSubmitting ? 'Saving...' : 'Reserve Table'}
      </button>
    </motion.form>
  );
}
