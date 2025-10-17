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
import { useLanguage } from './lib/languageContext';

type View = 'landing' | 'categories' | 'products' | 'admin-login' | 'admin-dashboard';

interface HistoryState {
  view: View;
  categoryBreadcrumb?: Array<{ id: string | null; name: string }>;
  selectedCategoryId?: string;
  breadcrumb?: Array<{ id: string | null; name: string }>;
}

const isValidView = (view: unknown): view is View => {
  return typeof view === 'string' && ['landing', 'categories', 'products', 'admin-login', 'admin-dashboard'].includes(view);
};

const isValidBreadcrumb = (breadcrumb: unknown): breadcrumb is Array<{ id: string | null; name: string }> => {
  if (!Array.isArray(breadcrumb)) return false;
  return breadcrumb.every(item =>
    item &&
    typeof item === 'object' &&
    'id' in item &&
    'name' in item &&
    (item.id === null || typeof item.id === 'string') &&
    typeof item.name === 'string'
  );
};

function App() {
  const { language } = useLanguage();
  const [view, setView] = useState<View>('landing');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [breadcrumb, setBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([]);
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState<Array<{ id: string | null; name: string }>>([{ id: null, name: language === 'en' ? 'Main Categories' : 'Ana Kategoriler' }]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    loadSettings();
    detectBranch();
    checkAdminAuth();

    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') {
      setView('admin-login');
    }

    const handlePopState = () => {
      const state = window.history.state as HistoryState | null;
      if (state && typeof state === 'object') {
        // Validate view
        if (isValidView(state.view)) {
          setView(state.view);
        }
        // Validate and set categoryBreadcrumb
        if (state.categoryBreadcrumb && isValidBreadcrumb(state.categoryBreadcrumb)) {
          setCategoryBreadcrumb(state.categoryBreadcrumb);
        }
        // Validate and set selectedCategoryId
        if (state.selectedCategoryId && typeof state.selectedCategoryId === 'string') {
          setSelectedCategoryId(state.selectedCategoryId);
        }
        // Validate and set breadcrumb
        if (state.breadcrumb && isValidBreadcrumb(state.breadcrumb)) {
          setBreadcrumb(state.breadcrumb);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    const newBreadcrumb = [{ id: null, name: language === 'en' ? 'Main Categories' : 'Ana Kategoriler' }];
    setCategoryBreadcrumb(newBreadcrumb);
    setView('categories');
    const state: HistoryState = { view: 'categories', categoryBreadcrumb: newBreadcrumb };
    window.history.pushState(state, '', '');
  };

  const handleCategorySelect = (categoryId: string, breadcrumb: Array<{ id: string | null; name: string }>) => {
    setSelectedCategoryId(categoryId);
    setBreadcrumb(breadcrumb);
    setView('products');
    const state: HistoryState = { view: 'products', selectedCategoryId: categoryId, breadcrumb };
    window.history.pushState(state, '', '');
  };


  const handleBreadcrumbClick = (clickedBreadcrumb: Array<{ id: string | null; name: string }>) => {
    setCategoryBreadcrumb(clickedBreadcrumb);
    setView('categories');
    const state: HistoryState = { view: 'categories', categoryBreadcrumb: clickedBreadcrumb };
    window.history.pushState(state, '', '');
  };

  const handleLogoClick = () => {
    setView('landing');
    const state: HistoryState = { view: 'landing' };
    window.history.pushState(state, '', '/');
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
    return <Products categoryId={selectedCategoryId} breadcrumb={breadcrumb} settings={settings} branchId={currentBranch?.id || null} onBreadcrumbClick={handleBreadcrumbClick} onLogoClick={handleLogoClick} />;
  }

  return null;
}

export default App;
