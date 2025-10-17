import { useState, useEffect } from 'react';
import { Landing } from './pages/Landing';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Settings, Branch } from './lib/supabase';
import { api } from './lib/api';
import { adminApi } from './lib/adminApi';
import { detectBranchFromHostname, hasSubdomain } from './lib/branchDetection';

type View = 'landing' | 'categories' | 'products' | 'admin-login' | 'admin-dashboard';

function App() {
  const [view, setView] = useState<View>('landing');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([]);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: 'Ana Kategoriler' }]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [branchNotFound, setBranchNotFound] = useState(false);

  useEffect(() => {
    loadSettings();
    detectBranch();
    checkAdminAuth();

    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setView('admin-login');
    }

    const handlePopState = () => {
      const state = window.history.state;
      if (state) {
        setView(state.view);
        if (state.categoryBreadcrumb) {
          setCategoryBreadcrumb(state.categoryBreadcrumb);
        }
        if (state.selectedCategoryId) {
          setSelectedCategoryId(state.selectedCategoryId);
        }
        if (state.breadcrumb) {
          setBreadcrumb(state.breadcrumb);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const detectBranch = async () => {
    try {
      const hasSubdomainInUrl = hasSubdomain();
      const branch = await detectBranchFromHostname();

      if (hasSubdomainInUrl && !branch) {
        setBranchNotFound(true);
      } else {
        setBranchNotFound(false);
        setCurrentBranch(branch);
      }
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
    const newBreadcrumb = [{ id: null, name: 'Ana Kategoriler' }];
    setCategoryBreadcrumb(newBreadcrumb);
    setView('categories');
    window.history.pushState(
      { view: 'categories', categoryBreadcrumb: newBreadcrumb },
      '',
      ''
    );
  };

  const handleCategorySelect = (categoryId: string, breadcrumb: Array<{ id: string | null; name: string }>) => {
    setSelectedCategoryId(categoryId);
    setBreadcrumb(breadcrumb);
    setView('products');
    window.history.pushState(
      { view: 'products', selectedCategoryId: categoryId, breadcrumb },
      '',
      ''
    );
  };


  const handleBreadcrumbClick = (clickedBreadcrumb: Array<{ id: string | null; name: string }>) => {
    setCategoryBreadcrumb(clickedBreadcrumb);
    setView('categories');
    window.history.pushState(
      { view: 'categories', categoryBreadcrumb: clickedBreadcrumb },
      '',
      ''
    );
  };

  const handleLogoClick = () => {
    setView('landing');
    window.history.pushState({ view: 'landing' }, '', '/');
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

  if (branchNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">Şube Bulunamadı</div>
          <div className="text-gray-600">Girdiğiniz adres geçerli bir şube adresi değil.</div>
        </div>
      </div>
    );
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
    return <Products categoryId={selectedCategoryId} breadcrumb={breadcrumb} settings={settings} branchId={currentBranch?.id || null} onBreadcrumbClick={handleBreadcrumbClick} onLogoClick={handleLogoClick} />;
  }

  return null;
}

export default App;
