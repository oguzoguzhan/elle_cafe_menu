import { useEffect, useState } from 'react';
import { Category, Settings } from '../lib/supabase';
import { api } from '../lib/api';
import { Header } from '../components/Header';

interface CategoriesProps {
  settings: Settings;
  branchId: string | null;
  breadcrumb: Array<{ id: string | null; name: string }>;
  onCategorySelect: (categoryId: string, breadcrumb: Array<{ id: string | null; name: string }>) => void;
  onBreadcrumbUpdate: (breadcrumb: Array<{ id: string | null; name: string }>) => void;
  onLogoClick: () => void;
}

export function Categories({ settings, branchId, breadcrumb, onCategorySelect, onBreadcrumbUpdate, onLogoClick }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parentId = breadcrumb[breadcrumb.length - 1].id;
    loadCategories(parentId);
  }, [breadcrumb, branchId]);

  const loadCategories = async (parentId: string | null) => {
    setLoading(true);
    try {
      const data = await api.categories.getAll(parentId, branchId);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category: Category) => {
    const hasSubcategories = await api.categories.hasSubcategories(category.id);

    if (hasSubcategories) {
      onBreadcrumbUpdate([...breadcrumb, { id: category.id, name: category.name }]);
    } else {
      const productBreadcrumb = [...breadcrumb, { id: category.id, name: category.name }];
      onCategorySelect(category.id, productBreadcrumb);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    onBreadcrumbUpdate(newBreadcrumb);
  };

  const handleBack = () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = breadcrumb.slice(0, -1);
      onBreadcrumbUpdate(newBreadcrumb);
    }
  };

  const isSubcategory = breadcrumb.length > 1;

  const gridClass = settings.category_grid === 'one'
    ? 'grid-cols-1'
    : 'grid-cols-2';

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.categories_bg_color }}>
      <Header
        settings={settings}
        onLogoClick={onLogoClick}
        showBackButton={isSubcategory}
        onBackClick={handleBack}
      />

      <div className="shadow-sm" style={{ backgroundColor: settings.nav_bg_color }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                {index > 0 && <span style={{ color: settings.nav_text_color, opacity: 0.5 }}>/</span>}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  style={{
                    fontSize: `${settings.nav_font_size}px`,
                    color: settings.nav_text_color,
                    fontWeight: index === breadcrumb.length - 1 ? 600 : 400,
                    opacity: index === breadcrumb.length - 1 ? 1 : 0.8,
                  }}
                >
                  {item.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Yükleniyor...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-600">Kategori bulunamadı</div>
        ) : (
          <div className={`grid ${gridClass} gap-4`}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {category.image_url && (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3
                    className="font-semibold"
                    style={{
                      fontSize: `${settings.category_name_font_size}px`,
                      color: settings.category_name_color
                    }}
                  >
                    {category.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
