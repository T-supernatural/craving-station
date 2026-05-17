import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Filter } from 'lucide-react';

export default function GalleryGrid() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Food', 'Ambiance', 'Events', "Chef's Table"];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery images:', error);
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(img => img.category === selectedCategory);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-2xl bg-yakoyo-surface"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-yakoyo-accent text-black'
                : 'bg-yakoyo-surface text-white hover:bg-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="masonry columns-1 gap-4 sm:columns-2 lg:columns-3">
        {filteredImages.map((image) => (
          <motion.div
            key={image.id}
            className="mb-4 overflow-hidden rounded-2xl"
            whileHover={{ scale: 1.03 }}
          >
            <img
              src={image.image_url}
              alt={image.caption || 'Gallery image'}
              className="w-full cursor-pointer object-cover transition duration-500"
              onClick={() => setActive(image)}
              loading="lazy"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <Filter size={48} className="mx-auto text-yakoyo-muted mb-4" />
          <p className="text-yakoyo-muted">
            {selectedCategory === 'All' ? 'No images available' : `No ${selectedCategory.toLowerCase()} images yet`}
          </p>
        </div>
      )}

      {/* Full Screen Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActive(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={active.image_url}
              alt={active.caption || 'Gallery image'}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
            {active.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-xl">
                <p className="text-white text-lg font-medium">{active.caption}</p>
                <p className="text-yakoyo-muted text-sm mt-1">{active.category}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
