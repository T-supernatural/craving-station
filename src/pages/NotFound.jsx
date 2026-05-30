import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to Johjay Foods homepage."
      />
      <div className="min-h-screen bg-yakoyo-bg flex items-center justify-center p-4">
        <div className="glass-card max-w-lg w-full p-8 text-center">
          <div className="text-8xl font-serif text-yakoyo-accent mb-4">404</div>
          <h1 className="text-3xl font-serif text-white mb-4">Page Not Found</h1>
          <p className="text-yakoyo-muted mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-yakoyo-accent text-black px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
            >
              <Home size={18} />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={18} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </>
  );
}