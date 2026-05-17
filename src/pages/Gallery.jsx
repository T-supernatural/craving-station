import GalleryGrid from '../components/GalleryGrid';

export default function Gallery() {
  return (
    <section className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="text-4xl font-serif">Bakery Gallery</h1>
      <p className="mt-2 text-yakoyo-muted">A curated glimpse into our bakery, cakes, pastries, and event presentation.</p>
      <div className="mt-8">
        <GalleryGrid />
      </div>
    </section>
  );
}
