import { motion } from 'framer-motion';
import { formatNaira } from '../utils/formatNaira';

const buildImageUrl = (src) => {
  if (!src) {
    return 'https://via.placeholder.com/720x405?text=No+image';
  }

  try {
    const url = new URL(src);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('w', '720');
    url.searchParams.set('q', '80');
    return url.toString();
  } catch (error) {
    return src;
  }
};

export default function MenuCard({ item, onAdd }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="glass-card overflow-hidden rounded-2xl border border-white/10 transition hover:border-yakoyo-accent hover:shadow-glow hover:scale-[1.02]"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          src={buildImageUrl(item.image_url)}
          alt={item.name}
          loading="lazy"
        />
        <div className="absolute left-4 top-4 rounded-full bg-yakoyo-accent px-3 py-1 text-xs font-semibold text-black">
          {item.category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif text-white">{item.name}</h3>
        <p className="mt-2 text-sm text-yakoyo-muted line-clamp-2">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-yakoyo-accent">{formatNaira(item.price)}</span>
          {onAdd && (
            <button
              onClick={() => onAdd(item)}
              className="rounded-full bg-yakoyo-accent px-4 py-2 text-xs font-semibold text-black hover:bg-opacity-90"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
