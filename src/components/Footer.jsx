import { useState } from 'react';
import { Instagram, Facebook, Twitter, Mail, Clock, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNewsletterSignup = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const API_HOST = import.meta.env.VITE_DJANGO_API_BASE_URL || 'http://127.0.0.1:8000';
      const API_BASE_URL = `${API_HOST.replace(/\/$/, '')}/api`;
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData && errData.email && Array.isArray(errData.email) && errData.email[0].includes('unique')) {
          toast.success("You're already subscribed!");
        } else {
          throw new Error(`Subscribe failed: ${res.status}`);
        }
      } else {
        toast.success('Successfully subscribed to our newsletter!');
        setEmail('');
      }
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-yakoyo-surface2 text-sm text-yakoyo-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-serif text-white">Johjay Foods</h3>
            <p className="mt-3 text-sm leading-relaxed">
              Professional catering and event food services — cakes, small chops, cocktails, and bespoke event menus.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Instagram" className="text-white hover:text-yakoyo-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Facebook" className="text-white hover:text-yakoyo-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-white hover:text-yakoyo-accent transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2">
              <li><Link className="hover:text-yakoyo-accent transition-colors" to="/menu">Menu</Link></li>
              <li><Link className="hover:text-yakoyo-accent transition-colors" to="/reservations">Catering</Link></li>
              <li><Link className="hover:text-yakoyo-accent transition-colors" to="/gallery">Gallery</Link></li>
              <li><Link className="hover:text-yakoyo-accent transition-colors" to="/order">Order Online</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-yakoyo-accent" />
                <span>34 Ember Ln, Cape Town, ZA</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-yakoyo-accent" />
                <span>+27 21 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-yakoyo-accent" />
                <span>hello@johjayfoods.com</span>
              </div>
            </div>
          </div>

          {/* Hours & Newsletter */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">Hours</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-yakoyo-accent" />
                <span>Mon-Thu: 5:00 PM - 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-yakoyo-accent" />
                <span>Fri-Sat: 5:00 PM - 11:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-yakoyo-accent" />
                <span>Sun: 4:00 PM - 9:00 PM</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-white uppercase tracking-wider">Newsletter</h4>
              <p className="text-xs mb-3">Stay updated with our latest dishes and events.</p>
              <form onSubmit={handleNewsletterSignup} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-sm text-white placeholder-yakoyo-muted focus:border-yakoyo-accent focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-yakoyo-accent py-2 text-sm font-semibold text-black hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs">© 2026 Johjay Foods. All rights reserved.</p>
            <div className="flex gap-6 text-xs">
              <Link className="hover:text-yakoyo-accent transition-colors" to="/privacy">Privacy Policy</Link>
              <Link className="hover:text-yakoyo-accent transition-colors" to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
