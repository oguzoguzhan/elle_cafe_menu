import { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Settings } from '../../lib/supabase';
import { api } from '../../lib/api';
import { adminApi } from '../../lib/adminApi';
import { uploadImage, deleteImage } from '../../lib/imageUpload';

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, 'logo');
      setSettings({ ...settings, logo_url: url });
      setMessage('Logo yüklendi. Kaydetmeyi unutmayın!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Logo upload error:', error);
      setMessage('Logo yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const handleLogoDelete = () => {
    if (!settings?.logo_url) return;
    if (!confirm('Logo silinecek, emin misiniz?')) return;

    setSettings({ ...settings, logo_url: null });
    setMessage('Logo kaldırıldı. Kaydetmeyi unutmayın!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleHeaderLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;

    setUploading(true);
    try {
      const url = await uploadImage(file, 'header-logo');
      setSettings({ ...settings, header_logo_url: url });
      setMessage('Header logo yüklendi. Kaydetmeyi unutmayın!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Header logo upload error:', error);
      setMessage('Header logo yükleme hatası');
    } finally {
      setUploading(false);
    }
  };

  const handleHeaderLogoDelete = () => {
    if (!settings?.header_logo_url) return;
    if (!confirm('Header logo silinecek, emin misiniz?')) return;

    setSettings({ ...settings, header_logo_url: null });
    setMessage('Header logo kaldırıldı. Kaydetmeyi unutmayın!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage('');

    try {
      await adminApi.settings.update(settings);
      setMessage('Ayarlar başarıyla kaydedildi');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Kaydetme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Yeni şifre en az 6 karakter olmalı');
      return;
    }

    setChangingPassword(true);

    try {
      const result = await adminApi.auth.changePassword(currentPassword, newPassword);

      if (result.success) {
        setPasswordMessage('Şifre başarıyla değiştirildi');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage(''), 3000);
      } else {
        setPasswordMessage(result.error || 'Şifre değiştirilemedi');
      }
    } catch (error) {
      setPasswordMessage('Bir hata oluştu');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>;
  }

  if (!settings) {
    return <div className="text-center py-12 text-red-600">Ayarlar yüklenemedi</div>;
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Giriş Sayfası Ayarları</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.bg_color}
                onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.bg_color}
                onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo
            </label>
            {settings.logo_url && (
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  className="h-20 w-auto object-contain border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={handleLogoDelete}
                  disabled={uploading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-fit">
              <Upload className="w-5 h-5" />
              {uploading ? 'Yükleniyor...' : 'Logo Yükle'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo Genişliği (px)
            </label>
            <input
              type="number"
              value={settings.logo_width}
              onChange={(e) => setSettings({ ...settings, logo_width: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="50"
              max="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hoş Geldiniz Yazısı
            </label>
            <input
              type="text"
              value={settings.welcome_text}
              onChange={(e) => setSettings({ ...settings, welcome_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yazı Boyutu (px)
            </label>
            <input
              type="number"
              value={settings.welcome_font_size}
              onChange={(e) => setSettings({ ...settings, welcome_font_size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="12"
              max="72"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yazı Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.welcome_color}
                onChange={(e) => setSettings({ ...settings, welcome_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.welcome_color}
                onChange={(e) => setSettings({ ...settings, welcome_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buton Yazısı
            </label>
            <input
              type="text"
              value={settings.button_text}
              onChange={(e) => setSettings({ ...settings, button_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buton Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.button_bg_color}
                onChange={(e) => setSettings({ ...settings, button_bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.button_bg_color}
                onChange={(e) => setSettings({ ...settings, button_bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buton Yazı Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.button_text_color}
                onChange={(e) => setSettings({ ...settings, button_text_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.button_text_color}
                onChange={(e) => setSettings({ ...settings, button_text_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Navigasyon Ayarları</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.nav_bg_color}
                onChange={(e) => setSettings({ ...settings, nav_bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.nav_bg_color}
                onChange={(e) => setSettings({ ...settings, nav_bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yazı Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.nav_text_color}
                onChange={(e) => setSettings({ ...settings, nav_text_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.nav_text_color}
                onChange={(e) => setSettings({ ...settings, nav_text_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yazı Boyutu (px)
            </label>
            <input
              type="number"
              value={settings.nav_font_size}
              onChange={(e) => setSettings({ ...settings, nav_font_size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="10"
              max="24"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Header Ayarları</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Logo
            </label>
            {settings.header_logo_url && (
              <div className="mb-2 flex items-center gap-2">
                <img
                  src={settings.header_logo_url}
                  alt="Header Logo"
                  className="h-20 w-auto object-contain border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={handleHeaderLogoDelete}
                  disabled={uploading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-fit">
              <Upload className="w-5 h-5" />
              {uploading ? 'Yükleniyor...' : 'Header Logo Yükle'}
              <input
                type="file"
                accept="image/*"
                onChange={handleHeaderLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Logo Genişliği (px)
            </label>
            <input
              type="number"
              value={settings.header_logo_width}
              onChange={(e) => setSettings({ ...settings, header_logo_width: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="50"
              max="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.header_bg_color}
                onChange={(e) => setSettings({ ...settings, header_bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.header_bg_color}
                onChange={(e) => setSettings({ ...settings, header_bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Yüksekliği (px)
            </label>
            <input
              type="number"
              value={settings.header_height}
              onChange={(e) => setSettings({ ...settings, header_height: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="60"
              max="200"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kategori Sayfası Ayarları</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.categories_bg_color}
                onChange={(e) => setSettings({ ...settings, categories_bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.categories_bg_color}
                onChange={(e) => setSettings({ ...settings, categories_bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Grid
            </label>
            <select
              value={settings.category_grid}
              onChange={(e) => setSettings({ ...settings, category_grid: e.target.value as 'one' | 'two' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="one">Tekli</option>
              <option value="two">İkili</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Adı Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.category_name_color}
                onChange={(e) => setSettings({ ...settings, category_name_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.category_name_color}
                onChange={(e) => setSettings({ ...settings, category_name_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori Adı Yazı Boyutu (px)
            </label>
            <input
              type="number"
              value={settings.category_name_font_size}
              onChange={(e) => setSettings({ ...settings, category_name_font_size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="12"
              max="36"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ürün Sayfası Ayarları</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.products_bg_color}
                onChange={(e) => setSettings({ ...settings, products_bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.products_bg_color}
                onChange={(e) => setSettings({ ...settings, products_bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Grid
            </label>
            <select
              value={settings.product_grid}
              onChange={(e) => setSettings({ ...settings, product_grid: e.target.value as 'one' | 'two' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="one">Tekli</option>
              <option value="two">İkili</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.product_name_color}
                onChange={(e) => setSettings({ ...settings, product_name_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.product_name_color}
                onChange={(e) => setSettings({ ...settings, product_name_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Adı Yazı Boyutu (px)
            </label>
            <input
              type="number"
              value={settings.product_name_font_size}
              onChange={(e) => setSettings({ ...settings, product_name_font_size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="12"
              max="36"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Açıklama Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.product_description_color}
                onChange={(e) => setSettings({ ...settings, product_description_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.product_description_color}
                onChange={(e) => setSettings({ ...settings, product_description_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Açıklama Yazı Boyutu (px)
            </label>
            <input
              type="number"
              value={settings.product_description_font_size}
              onChange={(e) => setSettings({ ...settings, product_description_font_size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="10"
              max="24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Fiyat Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.product_price_color}
                onChange={(e) => setSettings({ ...settings, product_price_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.product_price_color}
                onChange={(e) => setSettings({ ...settings, product_price_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Fiyat Yazı Boyutu (px)
            </label>
            <input
              type="number"
              value={settings.product_price_font_size}
              onChange={(e) => setSettings({ ...settings, product_price_font_size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="12"
              max="36"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uyarı Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.product_warning_bg_color}
                onChange={(e) => setSettings({ ...settings, product_warning_bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.product_warning_bg_color}
                onChange={(e) => setSettings({ ...settings, product_warning_bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uyarı Yazı Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.product_warning_color}
                onChange={(e) => setSettings({ ...settings, product_warning_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.product_warning_color}
                onChange={(e) => setSettings({ ...settings, product_warning_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uyarı Yazı Boyutu (px)
            </label>
            <input
              type="number"
              value={settings.product_warning_font_size}
              onChange={(e) => setSettings({ ...settings, product_warning_font_size: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              min="10"
              max="24"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Geri Butonu Ayarları</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arkaplan Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.back_button_bg_color}
                onChange={(e) => setSettings({ ...settings, back_button_bg_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.back_button_bg_color}
                onChange={(e) => setSettings({ ...settings, back_button_bg_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yazı Rengi
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.back_button_text_color}
                onChange={(e) => setSettings({ ...settings, back_button_text_color: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300"
              />
              <input
                type="text"
                value={settings.back_button_text_color}
                onChange={(e) => setSettings({ ...settings, back_button_text_color: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('başarıyla') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {saving ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>

    <div className="mt-8 pt-8 border-t border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Şifre Değiştir</h2>

      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mevcut Şifre
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yeni Şifre
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yeni Şifre (Tekrar)
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
            minLength={6}
          />
        </div>

        {passwordMessage && (
          <div className={`p-4 rounded-lg ${passwordMessage.includes('başarıyla') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {passwordMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={changingPassword}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {changingPassword ? 'Şifre Değiştiriliyor...' : 'Şifre Değiştir'}
        </button>
      </form>
    </div>
  </>
  );
}
