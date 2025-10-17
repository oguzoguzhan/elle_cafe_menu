import { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Settings, Branch } from './lib/supabase';
import { api } from './lib/api';
import { adminApi } from './lib/adminApi';
import { detectBranchFromHostname } from './lib/branchDetection';

type View = 'landing' | 'categories' | 'products' | 'admin-login' | 'admin-dashboard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([]);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: 'Ana Kategoriler' }]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    loadSettings();
    detectBranch();
    checkAdminAuth();

    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setView('admin-login');
    }
  }, []);

  const detectBranch = async () => {
    try {
      const branch = await detectBranchFromHostname();
      setCurrentBranch(branch);
    } catch (error) {
      console.error('Error detecting branch:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await api.settings.get();
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
    setCategoryBreadcrumb([{ id: null, name: 'Ana Kategoriler' }]);
    setView('categories');
  };

  const handleCategorySelect = (categoryId: string, breadcrumb: Array<{ id: string | null; name: string }>) => {
    setSelectedCategoryId(categoryId);
    setBreadcrumb(breadcrumb);
    setView('products');
  };


  const handleBreadcrumbClick = (clickedBreadcrumb: Array<{ id: string | null; name: string }>) => {
    setCategoryBreadcrumb(clickedBreadcrumb);
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
    return <Landing onEnter={handleEnterMenu} />;
  }

  if (view === 'categories') {
    return <Categories settings={settings} branchId={currentBranch?.id || null} breadcrumb={categoryBreadcrumb} onCategorySelect={handleCategorySelect} onBreadcrumbUpdate={setCategoryBreadcrumb} onLogoClick={handleLogoClick} />;
  }

  if (view === 'products') {
    return <Products categoryId={selectedCategoryId} breadcrumb={breadcrumb} settings={settings} onBreadcrumbClick={handleBreadcrumbClick} onLogoClick={handleLogoClick} />;
  }

  return null;
}

export default App;
