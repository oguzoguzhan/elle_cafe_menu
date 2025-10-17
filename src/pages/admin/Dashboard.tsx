import { useState } from 'react';
import { LogOut, Settings, FolderTree, Package, FileSpreadsheet } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { SettingsPage } from './SettingsPage';
import { CategoriesPage } from './CategoriesPage';
import { ProductsPage } from './ProductsPage';
import { BulkImportPage } from './BulkImportPage';

interface DashboardProps {
  onLogout: () => void;
}

type Tab = 'settings' | 'categories' | 'products' | 'bulk-import';

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  const handleLogout = async () => {
    await adminApi.auth.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Admin Paneli</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-5 h-5" />
              Genel Ayarlar
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                activeTab === 'categories'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FolderTree className="w-5 h-5" />
              Kategoriler
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                activeTab === 'products'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="w-5 h-5" />
              Ürünler
            </button>
            <button
              onClick={() => setActiveTab('bulk-import')}
              className={`flex items-center gap-2 px-6 py-4 font-medium ${
                activeTab === 'bulk-import'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              Toplu İşlem
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'settings' && <SettingsPage />}
          {activeTab === 'categories' && <CategoriesPage />}
          {activeTab === 'products' && <ProductsPage />}
          {activeTab === 'bulk-import' && <BulkImportPage />}
        </div>
      </div>
    </div>
  );
}
