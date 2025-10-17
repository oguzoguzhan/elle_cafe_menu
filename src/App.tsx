import { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Settings, api } from './lib/api';
import { adminApi } from './lib/adminApi';

type View = 'landing' | 'categories' | 'products' | 'admin-login' | 'admin-dashboard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    loadSettings();
    checkAdminAuth();

    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setView('admin-login');
    }
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const checkAdminAuth = async () => {
    const isAuth = await adminApi.auth.isAuthenticated();
    setIsAdminAuthenticated(isAuth);
  };

  useEffect(() => {
    if (view === 'admin-login' && isAdminAuthenticated) {
      setView('admin-dashboard');
    }
  }, [view, isAdminAuthenticated]);

  const handleEnterMenu = () => {
    setView('categories');
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setView('products');
  };

  const handleBackToCategories = () => {
    setView('categories');
  };

  const handleLogoClick = () => {
    setView('landing');
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setView('admin-dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setView('landing');
  };

  if (view === 'admin-login' || view === 'admin-dashboard') {
    if (view === 'admin-login') {
      return <Login onLogin={handleAdminLogin} />;
    }
    return <Dashboard onLogout={handleAdminLogout} />;
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  if (view === 'landing') {
    return <Landing settings={settings} onEnter={handleEnterMenu} />;
  }

  if (view === 'categories') {
    return (
      <Categories
        settings={settings}
        onCategorySelect={handleCategorySelect}
        onLogoClick={handleLogoClick}
      />
    );
  }

  if (view === 'products') {
    return (
      <Products
        categoryId={selectedCategoryId}
        settings={settings}
        onBack={handleBackToCategories}
        onLogoClick={handleLogoClick}
      />
    );
  }

  return null;
}

export default App;
