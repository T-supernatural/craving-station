import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (sent) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl border p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-serif mb-4">Check Your Email</h1>
          <p className="text-yakoyo-muted mb-6">We've sent you a password reset link.</p>
          <Link to="/login" className="text-yakoyo-accent hover:underline">Back to Login</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl border p-8 w-full max-w-md">
        <h1 className="text-3xl font-serif text-center mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              {...register('email')}
            />
            <p className="text-xs text-red-400">{errors.email?.message}</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-yakoyo-accent px-4 py-2 font-bold text-black transition hover:shadow-glow disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Email'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-yakoyo-accent hover:underline">Back to Login</Link>
        </div>
      </div>
    </section>
  );
}