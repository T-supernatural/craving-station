import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen bg-yakoyo-bg text-white">
      <Navbar />
      <main className="pt-24">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#141414', color: '#fff' } }} />
    </div>
  );
}

export default App;
