import { motion } from 'framer-motion';
import { useDeliveryFee } from '../hooks/useDeliveryFee';

export default function CartSidebar({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout, loading, formatNaira }) {
  const { deliveryFee, loading: feeLoading } = useDeliveryFee();
  const total = cart.subTotal + deliveryFee;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-yakoyo-surface p-5 shadow-2xl md:w-[360px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-xl font-serif">Your Order</h2>
          <button onClick={onClose} className="text-white hover:text-yakoyo-accent">
            ✕
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {cart.items.length === 0 ? (
            <p className="text-yakoyo-muted">Cart is empty</p>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{item.name}</p>
                  <span>{formatNaira ? formatNaira(item.price * item.quantity) : `$${Number(item.price * item.quantity).toFixed(2)}`}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="h-7 w-7 rounded border border-white/20 text-white hover:bg-white/10">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="h-7 w-7 rounded border border-white/20 text-white hover:bg-white/10">+</button>
                  </div>
                  <button onClick={() => onRemoveItem(item.id)} className="text-xs text-yakoyo-muted hover:text-red-400">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4">
          <div className="mb-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-yakoyo-muted">Subtotal</span>
              <span>{formatNaira ? formatNaira(cart.subTotal) : `$${cart.subTotal.toFixed(2)}`}</span>
            </div>
            {deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-yakoyo-muted">Delivery Fee</span>
                <span>{feeLoading ? 'Calculating...' : formatNaira ? formatNaira(deliveryFee) : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/10 pt-1 font-semibold">
              <span>Total</span>
              <span>{formatNaira ? formatNaira(total) : `$${total.toFixed(2)}`}</span>
            </div>
          </div>
          <button disabled={cart.items.length === 0 || loading} onClick={onCheckout} className="w-full rounded-xl bg-yakoyo-accent px-4 py-2 text-sm font-bold uppercase text-black transition hover:shadow-glow disabled:opacity-40">
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
