import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function OrderConfirmation() {
  return (
    <>
      <SEO title="Order Confirmation" description="Your order has been confirmed at Johjay Foods." />
      <section className="min-h-[70vh] flex items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">Order Confirmed!</h1>
          <p className="mb-6 text-lg text-yakoyo-muted">Thank you for your order. We’re preparing your items and will notify you once they’re ready for delivery or pickup.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-yakoyo-accent px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-300"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
