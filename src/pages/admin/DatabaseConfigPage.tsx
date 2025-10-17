import { useState, useEffect } from 'react';
import { Database, Plus, Trash2, CheckCircle, Circle, RefreshCw } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface DatabaseConfig {
  id: string;
  name: string;
  supabase_url: string;
  supabase_anon_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function DatabaseConfigPage() {
  const [configs, setConfigs] = useState<DatabaseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    supabase_url: '',
    supabase_anon_key: '',
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDatabaseConfigs();
      setConfigs(data);
    } catch (error) {
      console.error('Konfigürasyonlar yüklenirken hata:', error);
      alert('Konfigürasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.supabase_url || !formData.supabase_anon_key) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setSaving(true);
      await adminApi.createDatabaseConfig(formData);
      setFormData({ name: '', supabase_url: '', supabase_anon_key: '' });
      setShowForm(false);
      await loadConfigs();
      alert('Veritabanı konfigürasyonu oluşturuldu');
    } catch (error) {
      console.error('Konfigürasyon oluşturulurken hata:', error);
      alert('Konfigürasyon oluşturulamadı');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id: string) => {
    if (!confirm('Bu veritabanı konfigürasyonunu aktif hale getirmek istediğinizden emin misiniz? Uygulama yeniden başlatılacak.')) {
      return;
    }

    try {
      setSaving(true);
      await adminApi.setActiveDatabaseConfig(id);
      alert('Veritabanı konfigürasyonu aktif hale getirildi. Sayfa yenilenecek...');
      window.location.reload();
    } catch (error) {
      console.error('Konfigürasyon aktif edilirken hata:', error);
      alert('Konfigürasyon aktif edilemedi');
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const config = configs.find(c => c.id === id);

    if (config?.is_active) {
      alert('Aktif konfigürasyon silinemez');
      return;
    }

    if (!confirm('Bu veritabanı konfigürasyonunu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setSaving(true);
      await adminApi.deleteDatabaseConfig(id);
      await loadConfigs();
      alert('Konfigürasyon silindi');
    } catch (error) {
      console.error('Konfigürasyon silinirken hata:', error);
      alert('Konfigürasyon silinemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Veritabanı Konfigürasyonları</h2>
          <p className="text-gray-600 mt-1">
            Farklı Supabase veritabanı bağlantılarını yönetin
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Yeni Konfigürasyon
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Yeni Veritabanı Konfigürasyonu</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfigürasyon Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Üretim Veritabanı"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase URL
              </label>
              <input
                type="text"
                value={formData.supabase_url}
                onChange={(e) => setFormData({ ...formData, supabase_url: e.target.value })}
                placeholder="https://xxxxx.supabase.co"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Anon Key
              </label>
              <textarea
                value={formData.supabase_anon_key}
                onChange={(e) => setFormData({ ...formData, supabase_anon_key: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: '', supabase_url: '', supabase_anon_key: '' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {configs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Henüz veritabanı konfigürasyonu eklenmemiş</p>
          </div>
        ) : (
          configs.map((config) => (
            <div
              key={config.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                config.is_active
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {config.is_active ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {config.name}
                    </h3>
                    {config.is_active && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Aktif
                      </span>
                    )}
                  </div>
                  <div className="ml-8 space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">URL:</span> {config.supabase_url}
                    </p>
                    <p>
                      <span className="font-medium">Anon Key:</span>{' '}
                      {config.supabase_anon_key.substring(0, 20)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      Oluşturulma: {new Date(config.created_at).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!config.is_active && (
                    <button
                      onClick={() => handleSetActive(config.id)}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Aktif Yap
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(config.id)}
                    disabled={saving || config.is_active}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Önemli Notlar</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Bir veritabanı konfigürasyonunu aktif hale getirdiğinizde, uygulama o veritabanına bağlanır</li>
          <li>Aktif konfigürasyon değiştirildiğinde sayfa otomatik olarak yenilenir</li>
          <li>Aktif konfigürasyon silinemez</li>
          <li>Her seferinde sadece bir konfigürasyon aktif olabilir</li>
        </ul>
      </div>
    </div>
  );
}
