import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { Image, Upload, X } from 'lucide-react';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      toast.error('Failed to load gallery');
    } else {
      setImages(data || []);
    }
    setLoading(false);
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, file);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, path: filePath };
  };

  const handleUpload = async (formData) => {
    setUploading(true);
    try {
      const uploadResult = await uploadImage(formData.file);
      if (!uploadResult) return;

      const { error } = await supabase
        .from('gallery_images')
        .insert({
          image_url: uploadResult.url,
          caption: formData.caption,
          category: formData.category,
          storage_path: uploadResult.path
        });

      if (error) throw error;

      toast.success('Image uploaded successfully');
      setShowUpload(false);
      fetchImages();
    } catch (error) {
      toast.error('Failed to save image');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (id, storagePath) => {
    if (!confirm('Delete this image?')) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('gallery-images')
        .remove([storagePath]);

      // Delete from database
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Image deleted');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  if (loading) return <p className="text-yakoyo-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif">Gallery Management</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 rounded-xl bg-yakoyo-accent px-4 py-2 font-semibold text-black"
        >
          <Upload size={20} />
          Upload Image
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="glass-card overflow-hidden rounded-xl">
            <div className="aspect-square overflow-hidden">
              <img
                src={image.image_url}
                alt={image.caption || 'Gallery image'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <p className="text-sm text-yakoyo-muted mb-2">{image.category}</p>
              {image.caption && (
                <p className="text-sm text-white line-clamp-2">{image.caption}</p>
              )}
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => deleteImage(image.id, image.storage_path)}
                  className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700"
                  aria-label="Delete image"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <Image size={48} className="mx-auto text-yakoyo-muted mb-4" />
          <p className="text-yakoyo-muted">No images uploaded yet</p>
        </div>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUpload, uploading }) {
  const [formData, setFormData] = useState({
    file: null,
    caption: '',
    category: 'Ambiance'
  });
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select an image');
      return;
    }
    onUpload(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="glass-card w-full max-w-md rounded-xl p-6">
        <h2 className="text-xl font-serif mb-4">Upload Gallery Image</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {preview && (
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
            required
          />
          <input
            type="text"
            placeholder="Caption (optional)"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-lg border border-white/20 bg-yakoyo-surface px-3 py-2 text-white"
          >
            <option value="Food">Food</option>
            <option value="Ambiance">Ambiance</option>
            <option value="Events">Events</option>
            <option value="Chef's Table">Chef's Table</option>
          </select>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/20 py-2 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 rounded-lg bg-yakoyo-accent py-2 font-semibold text-black disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}