import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(7, 'Valid phone number required'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  city: z.string().min(2, 'City is required'),
  landmark: z.string().optional(),
});

export default function ProfileTab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(async ({ data, error }) => {
          if (error) {
            // If profile doesn't exist, create one
            if (error.code === 'PGRST116') {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  full_name: user.user_metadata?.full_name || null,
                  phone: user.user_metadata?.phone || null,
                })
                .select()
                .single();

              if (!createError && newProfile) {
                setProfile(newProfile);
                reset({
                  fullName: newProfile.full_name || '',
                  phone: newProfile.phone || '',
                  deliveryAddress: newProfile.delivery_address || '',
                  city: newProfile.city || '',
                  landmark: newProfile.landmark || '',
                });
              }
            }
          } else {
            setProfile(data);
            reset({
              fullName: data.full_name || '',
              phone: data.phone || '',
              deliveryAddress: data.delivery_address || '',
              city: data.city || '',
              landmark: data.landmark || '',
            });
          }
          setLoading(false);
        });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
          delivery_address: data.deliveryAddress,
          city: data.city,
          landmark: data.landmark,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated!');
      setProfile({ ...profile, ...data });
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
            {...register('fullName')}
          />
          <p className="text-xs text-red-400">{errors.fullName?.message}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Phone</label>
          <input
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
            {...register('phone')}
          />
          <p className="text-xs text-red-400">{errors.phone?.message}</p>
        </div>
        <div className="md:col-span-2">
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
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-yakoyo-accent px-6 py-2 font-bold text-black transition hover:shadow-glow disabled:opacity-50"
      >
        {isSubmitting ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}