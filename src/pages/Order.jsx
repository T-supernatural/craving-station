import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { Search, X, UtensilsCrossed } from 'lucide-react';
import PaystackPop from '@paystack/inline-js';
import { useAuth } from '../context/AuthContext';
import { createOrder, updateOrderStatus, deleteOrder } from '../lib/ordersApi';
import { fetchProducts } from '../lib/productsApi';
import CartSidebar from '../components/CartSidebar';
import MenuCard from '../components/MenuCard';
import useCart from '../hooks/useCart';
import { formatNaira } from '../utils/formatNaira';
import { useDeliveryFee } from '../hooks/useDeliveryFee';

const guestSchema = z.object({
  customerName: z.string().min(2, 'Name required'),
  customerEmail: z.string().email('Valid email required'),
  customerPhone: z.string().min(7, 'Valid phone required'),
  deliveryAddress: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  landmark: z.string().optional(),
  deliveryNotes: z.string().optional(),
});

export default function Order() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [profile, setProfile] = useState(null);
  const { deliveryFee } = useDeliveryFee();
  const paymentHandled = useRef(false);

  const cart = useCart();

  const categories = useMemo(() => ['all', 'starters', 'mains', 'desserts', 'drinks'], []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(guestSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const { items } = await fetchProducts();
        setMenuItems(items || []);
      } catch (error) {
        console.error('Order page product fetch failed:', {
          error,
          useBackend: import.meta.env.VITE_USE_DJANGO_PRODUCTS,
        });
        toast.error('Unable to load menu.');
      }

      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        full_name: user.full_name || user.email?.split('@')[0] || 'User',
        phone: user.phone || '',
        delivery_address: user.delivery_address || '',
        city: user.city || '',
        landmark: user.landmark || '',
        email: user.email || '',
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  const itemsToDisplay = useMemo(() => {
    let filtered = menuItems;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter((item) => item.category === category);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [category, menuItems, searchTerm]);

  const subTotal = cart.subTotal;
  const total = subTotal + deliveryFee;

  const onCheckout = async () => {
    if (cart.items.length === 0) {
      toast('Your cart is empty.');
      return;
    }

    if (user) {
      // Logged in: use profile data (fallback to auth user data if profile not loaded)
      const customerData = profile || {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        phone: user.user_metadata?.phone || null,
        delivery_address: null,
        city: null,
        landmark: null,
        email: user.email,
      };
      initiatePayment(customerData);
    } else {
      // Guest: show form
      setShowForm(true);
      setOpen(false);
    }
  };

  const onGuestSubmit = async (data) => {
    initiatePayment(data);
  };

  const initiatePayment = async (customerData) => {
    const setProcessing = setCheckoutLoading;
    setProcessing(true);
    paymentHandled.current = false;

    const customerEmail = user
      ? String(user.email || '').trim()
      : String(customerData.customerEmail || customerData.email || '').trim();
    const customerName = String(customerData.customerName || customerData.full_name || '');
    const customerPhone = String(customerData.customerPhone || customerData.phone || '');
    const deliveryAddress = String(customerData.deliveryAddress || customerData.delivery_address || '');
    const city = String(customerData.city || '');
    const landmark = String(customerData.landmark || '');
    const deliveryNotes = String(customerData.deliveryNotes || '');
    const orderTotal = Number(total);
    const cartItems = cart.items || [];

    try {
      const cleanEmail = String(customerEmail || '').trim();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        toast.error('Valid email is required for payment.');
        setProcessing(false);
        return;
      }

      const totalInKobo = Math.round(Number(orderTotal) * 100);
      if (!Number.isInteger(totalInKobo) || totalInKobo <= 0) {
        toast.error('Invalid order amount.');
        setProcessing(false);
        return;
      }

      const paystackKey = String(import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
      if (!paystackKey) {
        toast.error('Payment configuration error.');
        setProcessing(false);
        return;
      }

      const paymentRef = 'johjayfoods_' + new Date().getTime();

      // STEP 1: Save order BEFORE opening Paystack with status 'pending_payment'
      const savedOrder = await createOrder({
        customer_email: cleanEmail,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        city,
        landmark: landmark ?? '',
        delivery_notes: deliveryNotes ?? '',
        items: cartItems,
        subtotal: subTotal,
        delivery_fee: deliveryFee,
        total: orderTotal,
        payment_reference: paymentRef,
        status: 'pending_payment',
      });

      const orderId = savedOrder.id;

      // STEP 2: Open Paystack with the same reference
      const popup = new PaystackPop();

      popup.newTransaction({
        key: paystackKey,
        email: cleanEmail,
        amount: totalInKobo,
        ref: paymentRef,
        onSuccess: async (transaction) => {
          if (paymentHandled.current) return;
          paymentHandled.current = true;

          try {
            await updateOrderStatus(orderId, 'pending', transaction.reference);
          } catch (err) {
            console.error('Status update error:', err);
            // Order already saved — not critical
          } finally {
            cart.clearCart();
            setProcessing(false);
            toast.success('Order placed successfully! 🎉');
            navigate('/order-confirmation');
          }
        },
        onCancel: async () => {
          if (paymentHandled.current) return;
          paymentHandled.current = true;

          try {
            await deleteOrder(orderId, paymentRef);
          } catch (err) {
            console.error('Failed to cancel order on payment cancel:', err);
          }

          toast.error('Payment cancelled. Your order was not placed.');
          setProcessing(false);
        },
      });
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment error: ' + (err.message || err));
      setProcessing(false);
    }
  };


  if (showForm) {
    return (
      <section className="mx-auto max-w-2xl p-4 md:p-8">
        <div className="glass-card rounded-3xl border p-8">
          <h1 className="text-3xl font-serif mb-6">Delivery Details</h1>
          <form onSubmit={handleSubmit(onGuestSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('customerName')} />
                <p className="text-xs text-red-400">{errors.customerName?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('customerEmail')} />
                <p className="text-xs text-red-400">{errors.customerEmail?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <input className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('customerPhone')} />
                <p className="text-xs text-red-400">{errors.customerPhone?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">City</label>
                <input className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('city')} />
                <p className="text-xs text-red-400">{errors.city?.message}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1">Delivery Address</label>
                <input className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('deliveryAddress')} />
                <p className="text-xs text-red-400">{errors.deliveryAddress?.message}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Landmark (Optional)</label>
                <input className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('landmark')} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Delivery Notes (Optional)</label>
                <input className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white" {...register('deliveryNotes')} />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-6">
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatNaira(subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatNaira(deliveryFee)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-white/10 pt-1">
                  <span>Total</span>
                  <span>{formatNaira(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10">
                Back to Cart
              </button>
              <button type="submit" disabled={isSubmitting || checkoutLoading} className="flex-1 rounded-xl bg-yakoyo-accent px-4 py-2 font-bold text-black transition hover:shadow-glow disabled:opacity-50">
                {isSubmitting || checkoutLoading ? 'Processing...' : `Pay ${formatNaira(total)}`}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif">Bakery Order</h1>
          <p className="text-yakoyo-muted">Select your favorites and complete payment for delivery or pickup.</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-full bg-yakoyo-accent px-5 py-2 font-semibold text-black">
          Cart ({cart.totalItems})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yakoyo-muted h-4 w-4" />
          <input
            type="text"
            placeholder="Search treats, e.g. cake, pastry, donut, bread..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-yakoyo-surface border border-gray-600 rounded-lg text-white placeholder-yakoyo-muted focus:border-yakoyo-accent focus:outline-none focus:ring-1 focus:ring-yakoyo-accent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-yakoyo-muted hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button onClick={() => setCategory(cat)} key={cat} className={`rounded-full px-4 py-2 ${category === cat ? 'bg-yakoyo-accent text-black' : 'bg-yakoyo-surface text-white'}`}>
            {cat}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-yakoyo-muted">Loading menu...</p>
      ) : itemsToDisplay.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UtensilsCrossed className="h-16 w-16 text-yakoyo-accent mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No dishes found for '{searchTerm}'
          </h3>
          <p className="text-yakoyo-muted">
            Try searching for Egusi, Jollof, or Chapman
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {itemsToDisplay.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAdd={(v) => {
                cart.addItem(v);
                toast.success(`${v.name} added to cart`);
              }}
            />
          ))}
        </div>
      )}

      <CartSidebar
        isOpen={open}
        onClose={() => setOpen(false)}
        cart={cart}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onCheckout={onCheckout}
        loading={checkoutLoading}
        formatNaira={formatNaira}
      />
    </section>
  );
}
