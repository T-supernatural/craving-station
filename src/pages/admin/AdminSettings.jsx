import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { formatNaira } from '../../utils/formatNaira';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    restaurant_name: '',
    restaurant_description: '',
    restaurant_address: '',
    restaurant_phone: '',
    restaurant_email: '',
    delivery_fee: 1500,
    accept_orders: true,
    accept_reservations: true,
    opening_hours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('id', 1)
        .limit(1);

      if (error) {
        throw error;
      }

      const record = data?.[0];
      if (record) {
        setSettings((prev) => ({
          ...prev,
          restaurant_name: record.restaurant_name ?? prev.restaurant_name,
          restaurant_description: record.restaurant_description ?? prev.restaurant_description,
          restaurant_address: record.restaurant_address ?? prev.restaurant_address,
          restaurant_phone: record.restaurant_phone ?? prev.restaurant_phone,
          restaurant_email: record.restaurant_email ?? prev.restaurant_email,
          delivery_fee: record.delivery_fee ?? prev.delivery_fee,
          accept_orders: record.accept_orders ?? prev.accept_orders,
          accept_reservations: record.accept_reservations ?? prev.accept_reservations,
          opening_hours: record.opening_hours ?? prev.opening_hours,
        }));
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.delivery_fee || settings.delivery_fee <= 0) {
      toast.error('Delivery fee must be a positive number');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        restaurant_name: settings.restaurant_name,
        restaurant_description: settings.restaurant_description,
        restaurant_address: settings.restaurant_address,
        restaurant_phone: settings.restaurant_phone,
        restaurant_email: settings.restaurant_email,
        delivery_fee: Number(settings.delivery_fee),
        accept_orders: Boolean(settings.accept_orders),
        accept_reservations: Boolean(settings.accept_reservations),
        opening_hours: settings.opening_hours,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('restaurant_settings')
        .update(payload)
        .eq('id', 1);

      if (error) {
        // fallback to upsert if row missing
        const { error: upsertError } = await supabase
          .from('restaurant_settings')
          .upsert({ id: 1, ...payload });
        if (upsertError) throw upsertError;
      }

      toast.success('Delivery fee updated successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateOpeningHours = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-yakoyo-surface rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-yakoyo-surface rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif flex items-center gap-3">
          <SettingsIcon size={32} />
          Bakery Settings
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-yakoyo-accent px-6 py-3 font-semibold text-black hover:bg-opacity-90 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bakery Name</label>
              <input
                type="text"
                value={settings.restaurant_name}
                onChange={(e) => updateSetting('restaurant_name', e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bakery Description</label>
              <textarea
                value={settings.restaurant_description || ''}
                onChange={(e) => updateSetting('restaurant_description', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                type="text"
                value={settings.restaurant_address || ''}
                onChange={(e) => updateSetting('restaurant_address', e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="text"
                  value={settings.restaurant_phone || ''}
                  onChange={(e) => updateSetting('restaurant_phone', e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={settings.restaurant_email || ''}
                  onChange={(e) => updateSetting('restaurant_email', e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Settings */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Order Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accept Online Orders</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.accept_orders}
                  onChange={(e) => updateSetting('accept_orders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-yakoyo-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yakoyo-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yakoyo-accent"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Accept Catering Bookings</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.accept_reservations}
                  onChange={(e) => updateSetting('accept_reservations', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-yakoyo-surface peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yakoyo-accent/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yakoyo-accent"></div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Delivery Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-yakoyo-muted">₦</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.delivery_fee}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10) || 0;
                    if (value >= 0) updateSetting('delivery_fee', value);
                  }}
                  className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <p className="text-xs text-yakoyo-muted mt-1">Applied to all customer orders at checkout</p>
              <p className="text-xs text-yakoyo-accent mt-1">Currently showing as {formatNaira(settings.delivery_fee || 1500)} on cart</p>
            </div>
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Opening Hours</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(settings.opening_hours).map(([day, hours]) => (
            <div key={day} className="space-y-2">
              <h3 className="font-medium capitalize">{day}</h3>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={hours.open}
                  onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                  className="flex-1 rounded border border-white/20 bg-yakoyo-surface px-2 py-1 text-sm text-white"
                />
                <span className="text-yakoyo-muted">-</span>
                <input
                  type="time"
                  value={hours.close}
                  onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                  className="flex-1 rounded border border-white/20 bg-yakoyo-surface px-2 py-1 text-sm text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}