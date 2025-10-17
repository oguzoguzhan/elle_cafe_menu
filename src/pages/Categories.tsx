import { useEffect, useState } from 'react';
import { Category, Settings, api } from '../lib/api';
import { Header } from '../components/Header';

interface CategoriesProps {
  settings: Settings;
  onCategorySelect: (categoryId: number) => void;
  onLogoClick: () => void;
}

export function Categories({ settings, onCategorySelect, onLogoClick }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: Category) => {
    onCategorySelect(category.id);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.categories_bg_color || '#ffffff' }}>
      <Header
        settings={settings}
        onLogoClick={onLogoClick}
        showBackButton={false}
        onBackClick={() => {}}
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Yükleniyor...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-600">Kategori bulunamadı</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4"
              >
                <h3
                  className="font-semibold"
                  style={{
                    fontSize: `${settings.category_name_font_size || '20'}px`,
                    color: settings.category_name_color || '#1f2937'
                  }}
                >
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
