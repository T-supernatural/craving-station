import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl border p-8 w-full max-w-md">
        <h1 className="text-3xl font-serif text-center mb-6">Welcome Back</h1>
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
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              {...register('password')}
            />
            <p className="text-xs text-red-400">{errors.password?.message}</p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-yakoyo-accent px-4 py-2 font-bold text-black transition hover:shadow-glow disabled:opacity-50"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center space-y-2">
          <Link to="/forgot-password" className="text-yakoyo-accent hover:underline">Forgot Password?</Link>
          <p>Don't have an account? <Link to="/register" className="text-yakoyo-accent hover:underline">Sign Up</Link></p>
          <Link to="/order" className="block text-sm text-yakoyo-muted hover:text-white">Continue as Guest</Link>
        </div>
      </div>
    </section>
  );
}