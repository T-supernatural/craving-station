import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchProducts } from '../lib/productsApi';
import MenuCard from '../components/MenuCard';

const categories = ['all', 'starters', 'mains', 'desserts', 'drinks'];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      try {
        const { items } = await fetchProducts();
        setMenuItems(items);
      } catch (error) {
        console.error('Menu page product fetch failed:', error);
        toast.error('Unable to fetch menu items.');
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return menuItems;
    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  return (
    <section className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-4xl font-serif">Menu</h1>
        <p className="mt-2 text-yakoyo-muted">Browse our curated menu — rice dishes, local meals, soups, pasta, small chops, cocktails, cakes, and packages for events.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory === cat ? 'bg-yakoyo-accent text-black' : 'bg-yakoyo-surface text-white hover:bg-yakoyo-accent/70'}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-yakoyo-muted">Loading...</p>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.length === 0 ? <p className="text-yakoyo-muted">No items found.</p> : filtered.map((item) => <MenuCard key={item.id} item={item} />)}
        </motion.div>
      )}

      <div className="mt-12 rounded-xl bg-gradient-to-r from-yakoyo-accent to-orange-600 p-8 text-center text-black">
        <h2 className="text-2xl font-serif">Ready to Order?</h2>
        <p className="mt-2">Experience our culinary journey — place your order now.</p>
        <Link to="/order" className="mt-4 inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800">
          Order Online →
        </Link>
      </div>
    </section>
  );
}
