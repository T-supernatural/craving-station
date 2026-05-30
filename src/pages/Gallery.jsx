import GalleryGrid from '../components/GalleryGrid';

export default function Gallery() {
  return (
    <section className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="text-4xl font-serif">Gallery</h1>
      <p className="mt-2 text-yakoyo-muted">Event photos, catering setups, cakes, and curated food displays from our recent events.</p>
      <div className="mt-8">
        <GalleryGrid />
      </div>
    </section>
  );
}
