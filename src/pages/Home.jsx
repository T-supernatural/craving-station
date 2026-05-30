import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="Home"
        description="Discover Johjay Foods — professional catering, event bookings, cakes, small chops, and memorable dining experiences."
        image="/og-home.jpg"
      />
      <section className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#332213_0%,#0a0a0a_38%,#050505_100%)]">
      <div className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1770&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-yakoyo-bg/70" />
        <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-start justify-center gap-8 px-4 text-left md:px-8">
          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl font-serif leading-tight text-white md:text-6xl">
            Where Memorable Events Meet Exceptional Food
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-xl text-lg text-yakoyo-muted md:text-2xl">
            Experience Johjay Foods — a modern catering and event food studio for celebrations, corporate events, and premium occasions.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="flex flex-wrap gap-4">
            <Link to="/reservations" className="rounded-2xl bg-yakoyo-accent px-7 py-3 text-sm font-bold uppercase text-black shadow-glow transition hover:shadow-lg md:text-base">
              Book Catering Service
            </Link>
            <Link to="/menu" className="rounded-2xl border border-white/40 px-7 py-3 text-sm uppercase text-white transition hover:border-yakoyo-accent hover:text-yakoyo-accent md:text-base">
              View Our Menu
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl p-4 md:p-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card rounded-3xl border p-8">
            <h2 className="text-3xl font-serif text-white">Our Story</h2>
            <p className="mt-4 text-yakoyo-muted">
              Johjay Foods is a professional catering and event food company crafting elegant cakes, curated menus, and bespoke event experiences with warm, modern service. We blend refined flavors, quality ingredients, and thoughtful presentation for every occasion.
            </p>
            <p className="mt-3 text-yakoyo-muted">
              Every creation is designed to delight the senses — from soft layers and rich fillings to thoughtful packaging and service. Whether it’s an intimate order or a tailored catering request, we make every moment feel deliciously memorable.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-3xl overflow-hidden border border-white/10">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80" alt="Bakery story" className="h-full w-full object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
}
