import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Branch } from '../../lib/supabase';
import { adminApi } from '../../lib/adminApi';

export function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sort_order: 0,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const data = await adminApi.branches.getAll();
      setBranches(data);
    } catch (error) {
      console.error('Error loading branches:', error);
      setMessage('Şubeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const maxSortOrder = Math.max(0, ...branches.map(b => b.sort_order));
    setFormData({
      name: '',
      sort_order: maxSortOrder + 1,
    });
    setIsAdding(true);
  };

  const handleEdit = (branch: Branch) => {
    setFormData({
      name: branch.name,
      sort_order: branch.sort_order,
    });
    setEditingId(branch.id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', sort_order: 0 });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage('Şube adı gerekli');
      return;
    }

    try {
      if (isAdding) {
        await adminApi.branches.create(formData);
        setMessage('Şube eklendi');
      } else if (editingId) {
        await adminApi.branches.update(editingId, formData);
        setMessage('Şube güncellendi');
      }
      await loadBranches();
      handleCancel();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving branch:', error);
      setMessage('Kaydetme hatası');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu şubeyi silmek istediğinize emin misiniz?')) return;

    try {
      await adminApi.branches.delete(id);
      setMessage('Şube silindi');
      await loadBranches();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting branch:', error);
      setMessage('Silme hatası');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Şubeler</h1>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Yeni Şube
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('hata') || message.includes('hatası') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-500">
          <h3 className="text-lg font-semibold mb-4">
            {isAdding ? 'Yeni Şube Ekle' : 'Şube Düzenle'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şube Adı *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Şube adını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sıra
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-5 h-5" />
                Kaydet
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sıra
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Şube Adı
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {branches.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Henüz şube eklenmemiş
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {branch.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {branch.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit2 className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
