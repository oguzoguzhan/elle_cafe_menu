import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Product, Settings } from '../lib/supabase';
import { api } from '../lib/api';
import { Header } from '../components/Header';

interface ProductsProps {
  categoryId: string;
  breadcrumb: Array<{ id: string | null; name: string }>;
  settings: Settings;
  onBreadcrumbClick: (breadcrumb: Array<{ id: string | null; name: string }>) => void;
  onLogoClick: () => void;
}

export function Products({ categoryId, breadcrumb, settings, onBreadcrumbClick, onLogoClick }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [categoryId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.products.getByCategoryId(categoryId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleBack = () => {
    const newBreadcrumb = breadcrumb.slice(0, -1);
    onBreadcrumbClick(newBreadcrumb);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return `₺${price.toFixed(2)}`;
  };

  const getPriceDisplay = (product: Product) => {
    const prices = [];

    if (product.price_single) {
      prices.push({ label: 'Fiyat', value: product.price_single });
    }
    if (product.price_small) {
      prices.push({ label: 'Küçük', value: product.price_small });
    }
    if (product.price_medium) {
      prices.push({ label: 'Orta', value: product.price_medium });
    }
    if (product.price_large) {
      prices.push({ label: 'Büyük', value: product.price_large });
    }

    return prices;
  };

  const gridClass = settings.product_grid === 'one'
    ? 'grid-cols-1'
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.products_bg_color }}>
      <Header
        settings={settings}
        onLogoClick={onLogoClick}
        showBackButton={true}
        onBackClick={handleBack}
      />

      <div className="shadow-sm" style={{ backgroundColor: settings.nav_bg_color }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto">
            {breadcrumb.map((item, index) => (
              <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                {index > 0 && <span style={{ color: settings.nav_text_color, opacity: 0.5 }}>/</span>}
                <button
                  onClick={index === breadcrumb.length - 1 ? undefined : () => onBreadcrumbClick(breadcrumb.slice(0, index + 1))}
                  disabled={index === breadcrumb.length - 1}
                  style={{
                    fontSize: `${settings.nav_font_size}px`,
                    color: settings.nav_text_color,
                    fontWeight: index === breadcrumb.length - 1 ? 600 : 400,
                    opacity: index === breadcrumb.length - 1 ? 1 : 0.8,
                    cursor: index === breadcrumb.length - 1 ? 'default' : 'pointer',
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
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-600">Ürün bulunamadı</div>
        ) : (
          <div className={`grid ${gridClass} gap-4`}>
            {products.map((product) => {
              const prices = getPriceDisplay(product);
              const primaryPrice = prices[0];

              return (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-left flex items-center"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-32 h-32 object-cover flex-shrink-0"
                    />
                  )}
                  <div className="p-4 flex-1">
                    <h3
                      className="font-semibold mb-2"
                      style={{
                        fontSize: `${settings.product_name_font_size}px`,
                        color: settings.product_name_color
                      }}
                    >
                      {product.name}
                    </h3>
                    {product.description && (
                      <p
                        className="mb-3"
                        style={{
                          fontSize: `${settings.product_description_font_size}px`,
                          color: settings.product_description_color
                        }}
                      >
                        {truncateText(product.description)}
                      </p>
                    )}
                    {primaryPrice && (
                      <div
                        className="font-bold"
                        style={{
                          fontSize: `${settings.product_price_font_size}px`,
                          color: settings.product_price_color
                        }}
                      >
                        {prices.length === 1
                          ? formatPrice(primaryPrice.value)
                          : `${formatPrice(primaryPrice.value)}+`}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2
                className="font-bold"
                style={{
                  fontSize: `${settings.product_name_font_size}px`,
                  color: settings.product_name_color
                }}
              >
                {selectedProduct.name}
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {selectedProduct.image_url && (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}

              {selectedProduct.description && (
                <p
                  className="mb-6 whitespace-pre-wrap"
                  style={{
                    fontSize: `${settings.product_description_font_size}px`,
                    color: settings.product_description_color
                  }}
                >
                  {selectedProduct.description}
                </p>
              )}

              {selectedProduct.warning && (
                <div
                  className="mb-6 p-3 rounded"
                  style={{
                    backgroundColor: settings.product_warning_bg_color,
                    color: settings.product_warning_color,
                    fontSize: `${settings.product_warning_font_size}px`,
                  }}
                >
                  <p className="font-medium whitespace-pre-wrap">
                    {selectedProduct.warning}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {getPriceDisplay(selectedProduct).map((price) => (
                  <div
                    key={price.label}
                    className="flex items-center justify-between py-2 border-b border-gray-200"
                  >
                    <span className="text-gray-700 font-medium">
                      {price.label}
                    </span>
                    <span
                      className="font-bold"
                      style={{
                        fontSize: `${settings.product_price_font_size}px`,
                        color: settings.product_price_color
                      }}
                    >
                      {formatPrice(price.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
