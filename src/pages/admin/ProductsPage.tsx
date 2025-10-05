import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { Product, Category } from '../../lib/api';
import { adminApi } from '../../lib/adminApi';
import { uploadImage, deleteImage } from '../../lib/imageUpload';

type ProductForm = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [formData, setFormData] = useState<ProductForm>({
    category_id: 0,
    name: '',
    image_url: null,
    description: null,
    warning: null,
    price_single: null,
    price_small: null,
    price_medium: null,
    price_large: null,
    sort_order: 0,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filterCategory, filterActive]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        adminApi.products.getAll(),
        adminApi.categories.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const filters: { categoryId?: string; active?: boolean } = {};

      if (filterCategory) {
        filters.categoryId = filterCategory;
      }

      if (filterActive === 'active') {
        filters.active = true;
      } else if (filterActive === 'inactive') {
        filters.active = false;
      }

      const data = await adminApi.products.getAll(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let dataToSave = { ...formData };

      if (formData.sort_order === 0) {
        const categoryProducts = products.filter(p => p.category_id === formData.category_id);
        const maxSortOrder = categoryProducts.reduce((max, p) => Math.max(max, p.sort_order), 0);
        dataToSave.sort_order = maxSortOrder + 1;
      } else {
        const categoryProducts = products.filter(
          p => p.category_id === formData.category_id && p.id !== editingId
        );
        const existingSortOrders = new Set(categoryProducts.map(p => p.sort_order));

        let targetSortOrder = formData.sort_order;
        while (existingSortOrders.has(targetSortOrder)) {
          targetSortOrder++;
        }
        dataToSave.sort_order = targetSortOrder;
      }

      if (editingId) {
        await adminApi.products.update(editingId, dataToSave);
      } else {
        await adminApi.products.create(dataToSave);
      }
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Ürün kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      category_id: product.category_id,
      name: product.name,
      image_url: product.image_url,
      description: product.description,
      warning: product.warning,
      price_single: product.price_single,
      price_small: product.price_small,
      price_medium: product.price_medium,
      price_large: product.price_large,
      sort_order: product.sort_order,
      active: product.active,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (formData.image_url) {
        await deleteImage(formData.image_url);
      }
      const url = await uploadImage(file, 'urun');
      setFormData({ ...formData, image_url: url });
    } catch (error) {
      alert('Görsel yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.image_url) return;
    if (!confirm('Görsel silinecek, emin misiniz?')) return;

    setUploading(true);
    try {
      await deleteImage(formData.image_url);
      setFormData({ ...formData, image_url: null });
    } catch (error) {
      alert('Görsel silme hatası');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;

    try {
      const product = products.find(p => p.id === id);
      if (product?.image_url) {
        await deleteImage(product.image_url);
      }
      await adminApi.products.delete(id);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ürün silinirken hata oluştu');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      category_id: '',
      name: '',
      image_url: null,
      description: null,
      warning: null,
      price_single: null,
      price_small: null,
      price_medium: null,
      price_large: null,
      sort_order: 0,
      active: true,
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Bilinmeyen';
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleBulkStatusChange = async (active: boolean) => {
    if (selectedProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin');
      return;
    }

    const statusText = active ? 'aktif' : 'pasif';
    if (!confirm(`${selectedProducts.length} ürünü ${statusText} yapmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedProducts.map(id =>
          adminApi.products.update(id, { active })
        )
      );
      await loadProducts();
      setSelectedProducts([]);
      alert(`${selectedProducts.length} ürün başarıyla ${statusText} yapıldı`);
    } catch (error) {
      console.error('Bulk update error:', error);
      alert('Toplu güncelleme sırasında hata oluştu');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Lütfen en az bir ürün seçin');
      return;
    }

    if (!confirm(`${selectedProducts.length} ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    try {
      const productsToDelete = products.filter(p => selectedProducts.includes(p.id));

      for (const product of productsToDelete) {
        try {
          if (product.image_url) {
            await deleteImage(product.image_url);
          }
          await adminApi.products.delete(product.id);
        } catch (error) {
          console.error(`Error deleting product ${product.id}:`, error);
        }
      }

      await loadProducts();
      setSelectedProducts([]);
      alert(`${productsToDelete.length} ürün başarıyla silindi`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Toplu silme sırasında hata oluştu');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Ürünler</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Ürün
        </button>
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedProducts.length} ürün seçildi
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusChange(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
            >
              Aktif Yap
            </button>
            <button
              onClick={() => handleBulkStatusChange(false)}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
            >
              Pasif Yap
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
            >
              Sil
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              Seçimi Temizle
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kategori
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tümü</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durum
          </label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Tümü</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedProducts.length === products.length && products.length > 0}
            onChange={handleSelectAll}
            className="w-4 h-4 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Tümünü Seç</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden relative">
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={() => handleSelectProduct(product.id)}
                className="w-5 h-5 rounded border-gray-300 bg-white shadow-sm cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <span className="text-gray-400 text-sm font-medium">Görsel Hazırlanıyor</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {getCategoryName(product.category_id)}
              </p>
              <p className="text-sm text-gray-600 mb-2 min-h-[20px] truncate">
                {product.description || ''}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <span>Sıra: {product.sort_order}</span>
                <span className={product.active ? 'text-green-600' : 'text-red-600'}>
                  {product.active ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  <Pencil className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-600">
            Ürün bulunamadı
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Ürün Düzenle' : 'Yeni Ürün'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Görsel
                </label>
                {formData.image_url && (
                  <div className="mb-2 flex items-center gap-2">
                    <img
                      src={formData.image_url}
                      alt="Ürün"
                      className="h-32 w-32 object-cover border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      disabled={uploading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-fit">
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Yükleniyor...' : 'Görsel Yükle'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Uyarı
                </label>
                <textarea
                  value={formData.warning || ''}
                  onChange={(e) => setFormData({ ...formData, warning: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Opsiyonel uyarı mesajı"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat (Tekli)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_single || ''}
                    onChange={(e) => setFormData({ ...formData, price_single: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Küçük Fiyat
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_small || ''}
                    onChange={(e) => setFormData({ ...formData, price_small: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orta Fiyat
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_medium || ''}
                    onChange={(e) => setFormData({ ...formData, price_medium: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Büyük Fiyat
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_large || ''}
                    onChange={(e) => setFormData({ ...formData, price_large: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sıra
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
