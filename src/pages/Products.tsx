import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Product, Settings, api } from '../lib/api';
import { Header } from '../components/Header';

interface ProductsProps {
  categoryId: number;
  settings: Settings;
  onBack: () => void;
  onLogoClick: () => void;
}

export function Products({ categoryId, settings, onBack, onLogoClick }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [categoryId]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(categoryId);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `₺${price.toFixed(2)}`;
  };

  const productsPerRow = parseInt(settings.products_per_row || '3');
  const gridCols = productsPerRow === 1 ? 'grid-cols-1' :
                   productsPerRow === 2 ? 'grid-cols-2' :
                   productsPerRow === 4 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.products_bg_color || '#ffffff' }}>
      <Header
        settings={settings}
        onLogoClick={onLogoClick}
        showBackButton={true}
        onBackClick={onBack}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Yükleniyor...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-600">Ürün bulunamadı</div>
        ) : (
          <div className={`grid ${gridCols} gap-4`}>
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {product.image_url && (
                  <div className="relative" style={{ paddingBottom: '75%' }}>
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ width: `${settings.product_image_width || '100'}%`, margin: '0 auto' }}
                    />
                  </div>
                )}
                <div className="p-4">
                  {product.warning_text && (
                    <div
                      className="mb-2 p-2 rounded text-center"
                      style={{
                        fontSize: `${settings.product_warning_font_size || '14'}px`,
                        color: settings.product_warning_text_color || '#dc2626',
                        backgroundColor: settings.product_warning_bg_color || '#fef2f2'
                      }}
                    >
                      {product.warning_text}
                    </div>
                  )}
                  <h3
                    className="font-semibold mb-2"
                    style={{
                      fontSize: `${settings.product_name_font_size || '18'}px`,
                      color: settings.product_name_color || '#1f2937'
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="font-bold"
                    style={{
                      fontSize: `${settings.product_price_font_size || '20'}px`,
                      color: settings.product_price_color || '#3b82f6'
                    }}
                  >
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {selectedProduct.image_url && (
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover"
              />
            )}

            <div className="p-6">
              {selectedProduct.warning_text && (
                <div
                  className="mb-4 p-3 rounded text-center"
                  style={{
                    fontSize: `${settings.product_warning_font_size || '14'}px`,
                    color: settings.product_warning_text_color || '#dc2626',
                    backgroundColor: settings.product_warning_bg_color || '#fef2f2'
                  }}
                >
                  {selectedProduct.warning_text}
                </div>
              )}

              <h2
                className="font-bold mb-4"
                style={{
                  fontSize: `${parseInt(settings.product_name_font_size || '18') + 6}px`,
                  color: settings.product_name_color || '#1f2937'
                }}
              >
                {selectedProduct.name}
              </h2>

              <p
                className="font-bold"
                style={{
                  fontSize: `${parseInt(settings.product_price_font_size || '20') + 8}px`,
                  color: settings.product_price_color || '#3b82f6'
                }}
              >
                {formatPrice(selectedProduct.price)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
