import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { Category, Branch, CategoryWithBranches } from '../../lib/supabase';
import { adminApi } from '../../lib/adminApi';
import { uploadImage, deleteImage } from '../../lib/imageUpload';
import { supabase } from '../../lib/supabase';

type CategoryForm = Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
  branch_ids: string[];
};

export function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithBranches[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryForm>({
    name: '',
    image_url: null,
    parent_id: null,
    sort_order: 0,
    active: true,
    branch_ids: [],
  });

  useEffect(() => {
    loadCategories();
    loadBranches();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (catError) throw catError;

      const { data: branchesData, error: branchError } = await supabase
        .from('category_branches')
        .select('category_id, branch_id');

      if (branchError) throw branchError;

      const categoriesWithBranches = (categoriesData || []).map(cat => ({
        ...cat,
        branch_ids: branchesData?.filter(cb => cb.category_id === cat.id).map(cb => cb.branch_id) || []
      }));

      setCategories(categoriesWithBranches);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let dataToSave = {
        name: formData.name,
        image_url: formData.image_url,
        parent_id: formData.parent_id,
        sort_order: formData.sort_order,
        active: formData.active,
      };

      if (!editingId && formData.sort_order === 0) {
        const maxSortOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0);
        dataToSave.sort_order = maxSortOrder + 1;
      }

      let categoryId = editingId;

      if (editingId) {
        await adminApi.categories.update(editingId, dataToSave);
      } else {
        const { data, error } = await supabase
          .from('categories')
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        categoryId = data.id;
      }

      if (categoryId) {
        await supabase
          .from('category_branches')
          .delete()
          .eq('category_id', categoryId);

        if (formData.branch_ids.length > 0) {
          const branchInserts = formData.branch_ids.map(branchId => ({
            category_id: categoryId,
            branch_id: branchId
          }));

          await supabase
            .from('category_branches')
            .insert(branchInserts);
        }
      }

      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Kategori kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (category: CategoryWithBranches) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      image_url: category.image_url,
      parent_id: category.parent_id,
      sort_order: category.sort_order,
      active: category.active,
      branch_ids: category.branch_ids || [],
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
      const url = await uploadImage(file, 'kategori');
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
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      const category = categories.find(c => c.id === id);
      if (category?.image_url) {
        await deleteImage(category.image_url);
      }
      await adminApi.categories.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Kategori silinirken hata oluştu');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      name: '',
      image_url: null,
      parent_id: null,
      sort_order: 0,
      active: true,
      branch_ids: [],
    });
  };

  const toggleBranch = (branchId: string) => {
    setFormData(prev => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(branchId)
        ? prev.branch_ids.filter(id => id !== branchId)
        : [...prev.branch_ids, branchId]
    }));
  };

  const getParentCategories = () => {
    return categories.filter(c => c.parent_id === null);
  };

  const buildCategoryTree = () => {
    const tree: Array<{ category: CategoryWithBranches; children: CategoryWithBranches[] }> = [];
    const parentCategories = categories.filter(c => c.parent_id === null);

    parentCategories.forEach(parent => {
      const children = categories.filter(c => c.parent_id === parent.id);
      tree.push({ category: parent, children });
    });

    return tree;
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Kategoriler</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Kategori
        </button>
      </div>

      <div className="space-y-4">
        {buildCategoryTree().map(({ category, children }) => (
          <div key={category.id} className="border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center gap-4">
                {category.image_url && (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {category.branch_ids && category.branch_ids.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {category.branch_ids.map(branchId => (
                          <span key={branchId} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                            {branches.find(b => b.id === branchId)?.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Tüm şubeler</span>
                    )}
                    <span>•</span>
                    <span>Sıra: {category.sort_order}</span>
                    <span>•</span>
                    <span className={category.active ? 'text-green-600' : 'text-red-600'}>
                      {category.active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {children.length > 0 && (
              <div className="p-4 space-y-2">
                {children.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center gap-4">
                      {child.image_url && (
                        <img
                          src={child.image_url}
                          alt={child.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{child.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {child.branch_ids && child.branch_ids.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {child.branch_ids.map(branchId => (
                                <span key={branchId} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                  {branches.find(b => b.id === branchId)?.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Tüm şubeler</span>
                          )}
                          <span>•</span>
                          <span>Sıra: {child.sort_order}</span>
                          <span>•</span>
                          <span className={child.active ? 'text-green-600' : 'text-red-600'}>
                            {child.active ? 'Aktif' : 'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(child)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            Henüz kategori eklenmemiş
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı
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
                      alt="Kategori"
                      className="h-20 w-20 object-cover border border-gray-300 rounded"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şubeler
                </label>
                <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {branches.map(branch => (
                    <label key={branch.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={formData.branch_ids.includes(branch.id)}
                        onChange={() => toggleBranch(branch.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-900">{branch.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Hiç şube seçilmezse tüm şubelerde görünür
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Üst Kategori
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Ana Kategori</option>
                  {getParentCategories().map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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
