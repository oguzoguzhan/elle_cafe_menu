import { useState } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { adminApi } from '../../lib/adminApi';

export function BulkImportPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [importMode, setImportMode] = useState<'update' | 'deleteAll'>('update');

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const [products, categories] = await Promise.all([
        adminApi.products.getAll(),
        adminApi.categories.getAll(),
      ]);

      const categoryMap = new Map(categories.map(c => [c.id, c]));

      const data = products.map(product => {
        const category = categoryMap.get(product.category_id);
        const parentCategory = category?.parent_id
          ? categoryMap.get(category.parent_id)
          : null;

        return {
          'ID': product.id,
          'Kategori': parentCategory?.name || category?.name || '',
          'Alt Kategori': parentCategory ? category?.name : '',
          'Ürün Adı': product.name,
          'Açıklama': product.description || '',
          'Uyarı': product.warning || '',
          'Fiyat': product.price_single || '',
          'Küçük Fiyat': product.price_small || '',
          'Orta Fiyat': product.price_medium || '',
          'Büyük Fiyat': product.price_large || '',
          'Sıra': product.sort_order,
          'Durum': product.active ? 'Aktif' : 'Pasif',
          'Resim': product.image_url || '',
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Ürünler');

      const colWidths = [
        { wch: 36 },
        { wch: 20 },
        { wch: 20 },
        { wch: 30 },
        { wch: 40 },
        { wch: 40 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 8 },
        { wch: 10 },
        { wch: 40 },
      ];
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `urunler_${new Date().toISOString().split('T')[0]}.xlsx`);
      showMessage('Ürünler başarıyla dışa aktarıldı', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showMessage('Dışa aktarma sırasında hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmMessage = importMode === 'deleteAll'
      ? 'UYARI: Tüm mevcut ürünler silinecek ve yeni ürünler yüklenecek. Emin misiniz?'
      : 'Ürünler güncellenecek/eklenecek. Devam etmek istiyor musunuz?';

    if (!confirm(confirmMessage)) {
      event.target.value = '';
      return;
    }

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (importMode === 'deleteAll') {
        const allProducts = await adminApi.products.getAll();
        await Promise.all(allProducts.map(p => adminApi.products.delete(p.id)));
      }

      const categories = await adminApi.categories.getAll();
      const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c]));

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const allProducts = await adminApi.products.getAll();

      for (const row of jsonData) {
        try {
          const mainCategoryName = (row['Kategori'] || '').toString().trim();
          const subCategoryName = (row['Alt Kategori'] || '').toString().trim();

          if (!mainCategoryName || !row['Ürün Adı']) {
            errorCount++;
            errors.push(`Satır atlandı: Kategori ve Ürün Adı zorunludur`);
            continue;
          }

          let targetCategory = categoryMap.get(mainCategoryName.toLowerCase());

          if (!targetCategory) {
            targetCategory = await adminApi.categories.create({
              name: mainCategoryName,
              image_url: null,
              parent_id: null,
              branch_id: null,
              sort_order: categories.length + 1,
              active: true,
            });
            categoryMap.set(mainCategoryName.toLowerCase(), targetCategory);
          }

          let categoryId = targetCategory.id;

          if (subCategoryName) {
            let subCategory = categories.find(
              c => c.name.toLowerCase() === subCategoryName.toLowerCase() &&
                   c.parent_id === targetCategory!.id
            );

            if (!subCategory) {
              subCategory = await adminApi.categories.create({
                name: subCategoryName,
                image_url: null,
                parent_id: targetCategory.id,
                branch_id: null,
                sort_order: categories.length + 1,
                active: true,
              });
              categories.push(subCategory);
            }

            categoryId = subCategory.id;
          }

          const productId = row['ID'];
          let sortOrder = row['Sıra'] ? parseInt(row['Sıra'].toString()) : 0;

          const categoryProducts = allProducts.filter(
            p => p.category_id === categoryId && p.id !== productId?.toString()
          );

          if (sortOrder === 0) {
            const maxSortOrder = categoryProducts.reduce((max, p) => Math.max(max, p.sort_order), 0);
            sortOrder = maxSortOrder + 1;
          } else {
            const existingSortOrders = new Set(categoryProducts.map(p => p.sort_order));
            while (existingSortOrders.has(sortOrder)) {
              sortOrder++;
            }
          }

          const productData = {
            category_id: categoryId,
            name: row['Ürün Adı'].toString().trim(),
            description: row['Açıklama'] ? row['Açıklama'].toString() : null,
            warning: row['Uyarı'] ? row['Uyarı'].toString() : null,
            image_url: row['Resim'] ? row['Resim'].toString() : null,
            price_single: row['Fiyat'] ? parseFloat(row['Fiyat'].toString()) : null,
            price_small: row['Küçük Fiyat'] ? parseFloat(row['Küçük Fiyat'].toString()) : null,
            price_medium: row['Orta Fiyat'] ? parseFloat(row['Orta Fiyat'].toString()) : null,
            price_large: row['Büyük Fiyat'] ? parseFloat(row['Büyük Fiyat'].toString()) : null,
            sort_order: sortOrder,
            active: row['Durum']?.toString().toLowerCase().includes('aktif') !== false,
          };

          if (importMode === 'deleteAll') {
            const newProduct = await adminApi.products.create(productData);
            allProducts.push(newProduct);
            successCount++;
          } else {
            if (productId) {
              try {
                await adminApi.products.update(productId.toString(), productData);
                const existingIndex = allProducts.findIndex(p => p.id === productId.toString());
                if (existingIndex !== -1) {
                  allProducts[existingIndex] = { ...allProducts[existingIndex], ...productData };
                }
                successCount++;
              } catch (updateError) {
                const newProduct = await adminApi.products.create(productData);
                allProducts.push(newProduct);
                successCount++;
              }
            } else {
              const newProduct = await adminApi.products.create(productData);
              allProducts.push(newProduct);
              successCount++;
            }
          }
        } catch (rowError: any) {
          errorCount++;
          errors.push(`Satır hatası: ${rowError.message}`);
        }
      }

      if (errorCount > 0) {
        showMessage(
          `İçe aktarma tamamlandı: ${successCount} başarılı, ${errorCount} hata. ${errors.slice(0, 3).join(', ')}`,
          'error'
        );
      } else {
        showMessage(`${successCount} ürün başarıyla içe aktarıldı`, 'success');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      showMessage(`İçe aktarma hatası: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Toplu Ürün Ekle / Güncelle
        </h2>
        <p className="text-sm text-gray-600">
          Excel dosyası ile toplu ürün ekleme, güncelleme ve dışa aktarma işlemleri
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Excel Formatı:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>ID (güncellemeler için, yeni kayıtlarda boş bırakın)</li>
              <li>Kategori (zorunlu) - Ana kategori adı</li>
              <li>Alt Kategori (opsiyonel) - Alt kategori varsa</li>
              <li>Ürün Adı (zorunlu)</li>
              <li>Açıklama</li>
              <li>Uyarı (opsiyonel)</li>
              <li>Fiyat (tekli fiyat)</li>
              <li>Küçük Fiyat, Orta Fiyat, Büyük Fiyat</li>
              <li>Sıra (0 ise otomatik atanır)</li>
              <li>Durum (Aktif/Pasif)</li>
              <li>Resim (URL)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">İçe Aktarma Modu</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              value="update"
              checked={importMode === 'update'}
              onChange={(e) => setImportMode(e.target.value as 'update' | 'deleteAll')}
              className="mt-1 w-4 h-4"
            />
            <div>
              <div className="font-medium text-gray-900">Güncelle</div>
              <div className="text-sm text-gray-600">
                Mevcut ürünleri güncelle, yeni ürünler ekle (ID eşleşmesine göre)
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              value="deleteAll"
              checked={importMode === 'deleteAll'}
              onChange={(e) => setImportMode(e.target.value as 'update' | 'deleteAll')}
              className="mt-1 w-4 h-4"
            />
            <div>
              <div className="font-medium text-red-600">Tüm Ürünleri Sil ve Yükle</div>
              <div className="text-sm text-gray-600">
                UYARI: Tüm mevcut ürünler silinecek ve Excel'deki ürünler yüklenecek
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex flex-col items-center gap-3"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Dışa Aktar
              </h3>
              <p className="text-sm text-gray-600">
                Mevcut ürünleri Excel dosyası olarak indir
              </p>
            </div>
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
          <label className="inline-flex flex-col items-center gap-3 cursor-pointer">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                İçe Aktar
              </h3>
              <p className="text-sm text-gray-600">
                Excel dosyasından ürün ekle/güncelle
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">İşleniyor...</p>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Notlar:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Yeni ürün eklerken ID sütununu boş bırakın</li>
          <li>• Mevcut ürünü güncellemek için ID sütununu doldurun</li>
          <li>• Kategori ve Alt Kategori yoksa otomatik oluşturulur</li>
          <li>• Sıra değeri 0 ise otomatik sıra numarası atanır</li>
          <li>• Durum sütunu: "Aktif" veya "Pasif" yazılmalı</li>
        </ul>
      </div>
    </div>
  );
}
