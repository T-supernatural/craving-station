import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(7, 'Valid phone number required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  city: z.string().min(2, 'City is required'),
  landmark: z.string().optional(),
});

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await signUp(data.email, data.password, {
        full_name: data.fullName,
        phone: data.phone,
        delivery_address: data.deliveryAddress,
        city: data.city,
        landmark: data.landmark,
      });

      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="glass-card rounded-3xl border p-8 w-full max-w-md">
        <h1 className="text-3xl font-serif text-center mb-6">Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Full Name</label>
            <input
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              {...register('fullName')}
            />
            <p className="text-xs text-red-400">{errors.fullName?.message}</p>
          </div>
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
          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              {...register('phone')}
            />
            <p className="text-xs text-red-400">{errors.phone?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Delivery Address</label>
            <input
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              {...register('deliveryAddress')}
            />
            <p className="text-xs text-red-400">{errors.deliveryAddress?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">City</label>
            <input
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              {...register('city')}
            />
            <p className="text-xs text-red-400">{errors.city?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Landmark (Optional)</label>
            <input
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              {...register('landmark')}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-yakoyo-accent px-4 py-2 font-bold text-black transition hover:shadow-glow disabled:opacity-50"
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>Already have an account? <Link to="/login" className="text-yakoyo-accent hover:underline">Sign In</Link></p>
        </div>
      </div>
    </section>
  );
}