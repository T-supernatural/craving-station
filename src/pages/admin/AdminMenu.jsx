import { useEffect, useState } from 'react';
import { createProduct, deleteProduct, fetchProducts, updateProduct, uploadProductImage } from '../../lib/productsApi';
import { formatNaira } from '../../utils/formatNaira';
import toast from 'react-hot-toast';

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const { items } = await fetchProducts();
      setMenuItems(items || []);
    } catch (error) {
      console.error('Admin menu product fetch failed:', {
        error,
        useBackend: import.meta.env.VITE_USE_DJANGO_PRODUCTS,
      });
      toast.error('Failed to load menu');
    }
    setLoading(false);
  };

  const toggleAvailable = async (id, available) => {
    try {
      await updateProduct(id, { available });
      toast.success('Updated');
      fetchMenu();
    } catch (error) {
      console.error('Admin menu toggle available failed:', error);
      toast.error('Failed to update');
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await deleteProduct(id);
      toast.success('Deleted');
      fetchMenu();
    } catch (error) {
      console.error('Admin menu delete failed:', error);
      toast.error('Failed to delete');
    }
  };

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">Menu Management</h1>
        <button onClick={() => setShowModal(true)} className="rounded-xl bg-yakoyo-accent px-4 py-2 font-semibold text-black">
          Add New Menu Item
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-yakoyo-surface2">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Available</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item) => (
              <tr key={item.id} className="border-t border-white/10">
                <td className="px-4 py-3">
                  <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded object-cover" />
                </td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">{formatNaira(item.price)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAvailable(item.id, !item.available)}
                    className={`px-2 py-1 rounded text-xs ${item.available ? 'bg-green-600' : 'bg-red-600'}`}
                  >
                    {item.available ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="text-blue-400 hover:underline">Edit</button>
                  <button onClick={() => deleteItem(item.id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <MenuModal
          item={editingItem}
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSave={() => { fetchMenu(); setShowModal(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}

function MenuModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    category: item?.category || 'starters',
    image_url: item?.image_url || '',
    available: item?.available ?? true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.image_url || '');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      return await uploadProductImage(file);
    } catch (error) {
      console.error('AdminMenu: Image upload failed', {
        error,
        useBackend: import.meta.env.VITE_USE_DJANGO_PRODUCTS,
      });
      toast.error(`Image upload failed: ${error?.message || 'Unable to upload image'}`);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = form.image_url;

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const data = { ...form, price: Number(form.price), image_url: imageUrl };

      if (item) {
        await updateProduct(item.id, data);
        toast.success('Updated');
      } else {
        await createProduct(data);
        toast.success('Added');
      }

      onSave();
    } catch (error) {
      console.error('Admin menu product save failed:', {
        error,
        action: item ? 'update' : 'create',
        useBackend: import.meta.env.VITE_USE_DJANGO_PRODUCTS,
      });
      toast.error('Failed to save: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-card rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-serif mb-4">{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Item Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
            rows="3"
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
          >
            <option value="starters">Starters</option>
            <option value="mains">Mains</option>
            <option value="desserts">Desserts</option>
            <option value="drinks">Drinks</option>
          </select>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Image</label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yakoyo-accent file:text-black file:font-semibold hover:file:bg-yakoyo-accent/80"
            />
            <p className="text-xs text-yakoyo-muted">Upload a new image or leave empty to keep current image</p>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
            />
            Available
          </label>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10">
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="flex-1 rounded-xl bg-yakoyo-accent px-4 py-2 font-bold text-black disabled:opacity-50">
              {uploading ? 'Saving...' : (item ? 'Update' : 'Add') + ' Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}