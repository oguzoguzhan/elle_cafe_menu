import { useState } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { adminApi } from '../../lib/adminApi';
import { supabase } from '../../lib/supabase';

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
      const [products, categories, branches, categoryBranches, productBranches] = await Promise.all([
        adminApi.products.getAll(),
        adminApi.categories.getAll(),
        adminApi.branches.getAll(),
        supabase.from('category_branches').select('*').then(r => r.data || []),
        supabase.from('product_branches').select('*').then(r => r.data || []),
      ]);

      const categoryMap = new Map(categories.map(c => [c.id, c]));
      const branchMap = new Map(branches.map(b => [b.id, b]));

      const getCategoryBranches = (categoryId: string) => {
        return categoryBranches
          .filter(cb => cb.category_id === categoryId)
          .map(cb => branchMap.get(cb.branch_id)?.name || '')
          .join(', ');
      };

      const getProductBranches = (productId: string) => {
        return productBranches
          .filter(pb => pb.product_id === productId)
          .map(pb => branchMap.get(pb.branch_id)?.name || '')
          .join(', ');
      };

      const data = products.map(product => {
        const category = categoryMap.get(product.category_id);
        const parentCategory = category?.parent_id
          ? categoryMap.get(category.parent_id)
          : null;

        const categoryBranchesStr = getCategoryBranches(category?.id || '');
        const parentCategoryBranchesStr = parentCategory ? getCategoryBranches(parentCategory.id) : '';

        return {
          'ID': product.id,
          'Kategori': parentCategory?.name_tr || category?.name_tr || '',
          'Kategori Şubeler': parentCategoryBranchesStr || categoryBranchesStr,
          'Alt Kategori': parentCategory ? category?.name_tr : '',
          'Alt Kategori Şubeler': parentCategory ? categoryBranchesStr : '',
          'Ürün Adı (TR)': product.name_tr,
          'Ürün Adı (EN)': product.name_en || '',
          'Açıklama (TR)': product.description_tr || '',
          'Açıklama (EN)': product.description_en || '',
          'Uyarı (TR)': product.warning_tr || '',
          'Uyarı (EN)': product.warning_en || '',
          'Fiyat': product.price_single || '',
          'Küçük Fiyat': product.price_small || '',
          'Orta Fiyat': product.price_medium || '',
          'Büyük Fiyat': product.price_large || '',
          'Ürün Şubeler': getProductBranches(product.id),
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
        { wch: 30 },
        { wch: 20 },
        { wch: 30 },
        { wch: 30 },
        { wch: 30 },
        { wch: 40 },
        { wch: 40 },
        { wch: 40 },
        { wch: 40 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 30 },
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

      const [categories, branches] = await Promise.all([
        adminApi.categories.getAll(),
        adminApi.branches.getAll(),
      ]);
      const categoryMap = new Map(categories.map(c => [c.name_tr.toLowerCase(), c]));
      const branchMap = new Map(branches.map(b => [b.name.toLowerCase(), b]));

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const allProducts = await adminApi.products.getAll();

      for (const row of jsonData) {
        try {
          const mainCategoryName = (row['Kategori'] || '').toString().trim();
          const mainCategoryBranchesStr = (row['Kategori Şubeler'] || '').toString().trim();
          const subCategoryName = (row['Alt Kategori'] || '').toString().trim();
          const subCategoryBranchesStr = (row['Alt Kategori Şubeler'] || '').toString().trim();

          if (!mainCategoryName || !row['Ürün Adı (TR)']) {
            errorCount++;
            errors.push(`Satır atlandı: Kategori ve Ürün Adı (TR) zorunludur`);
            continue;
          }

          let targetCategory = categoryMap.get(mainCategoryName.toLowerCase());
          let isNewMainCategory = false;

          if (!targetCategory) {
            targetCategory = await adminApi.categories.create({
              name_tr: mainCategoryName,
              name_en: null,
              image_url: null,
              parent_id: null,
              sort_order: categories.length + 1,
              active: true,
            });
            categoryMap.set(mainCategoryName.toLowerCase(), targetCategory);
            isNewMainCategory = true;
          }

          if (mainCategoryBranchesStr && !subCategoryName) {
            const categoryBranchNames = mainCategoryBranchesStr.split(',').map((b: string) => b.trim()).filter(Boolean);
            const categoryBranchIds = categoryBranchNames.map((name: string) => branchMap.get(name.toLowerCase())?.id).filter(Boolean);

            if (categoryBranchIds.length > 0) {
              if (isNewMainCategory) {
                await Promise.all(
                  categoryBranchIds.map(branchId =>
                    supabase.from('category_branches').insert({ category_id: targetCategory!.id, branch_id: branchId })
                  )
                );
              }
            }
          }

          let categoryId = targetCategory.id;

          if (subCategoryName) {
            let subCategory = categories.find(
              c => c.name_tr.toLowerCase() === subCategoryName.toLowerCase() &&
                   c.parent_id === targetCategory!.id
            );
            let isNewSubCategory = false;

            if (!subCategory) {
              subCategory = await adminApi.categories.create({
                name_tr: subCategoryName,
                name_en: null,
                image_url: null,
                parent_id: targetCategory.id,
                sort_order: categories.length + 1,
                active: true,
              });
              categories.push(subCategory);
              isNewSubCategory = true;
            }

            if (subCategoryBranchesStr) {
              const subCategoryBranchNames = subCategoryBranchesStr.split(',').map((b: string) => b.trim()).filter(Boolean);
              const subCategoryBranchIds = subCategoryBranchNames.map((name: string) => branchMap.get(name.toLowerCase())?.id).filter(Boolean);

              if (subCategoryBranchIds.length > 0) {
                if (isNewSubCategory) {
                  await Promise.all(
                    subCategoryBranchIds.map(branchId =>
                      supabase.from('category_branches').insert({ category_id: subCategory!.id, branch_id: branchId })
                    )
                  );
                }
              }
            } else if (mainCategoryBranchesStr && isNewSubCategory) {
              const categoryBranchNames = mainCategoryBranchesStr.split(',').map((b: string) => b.trim()).filter(Boolean);
              const categoryBranchIds = categoryBranchNames.map((name: string) => branchMap.get(name.toLowerCase())?.id).filter(Boolean);

              if (categoryBranchIds.length > 0) {
                await Promise.all(
                  categoryBranchIds.map(branchId =>
                    supabase.from('category_branches').insert({ category_id: subCategory!.id, branch_id: branchId })
                  )
                );
              }
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

          const productBranchesStr = (row['Ürün Şubeler'] || '').toString().trim();
          const productBranchNames = productBranchesStr ? productBranchesStr.split(',').map((b: string) => b.trim()).filter(Boolean) : [];
          const productBranchIds = productBranchNames.map((name: string) => branchMap.get(name.toLowerCase())?.id).filter(Boolean);

          const productData = {
            category_id: categoryId,
            name_tr: row['Ürün Adı (TR)'].toString().trim(),
            name_en: row['Ürün Adı (EN)'] ? row['Ürün Adı (EN)'].toString().trim() : null,
            description_tr: row['Açıklama (TR)'] ? row['Açıklama (TR)'].toString() : null,
            description_en: row['Açıklama (EN)'] ? row['Açıklama (EN)'].toString() : null,
            warning_tr: row['Uyarı (TR)'] ? row['Uyarı (TR)'].toString() : null,
            warning_en: row['Uyarı (EN)'] ? row['Uyarı (EN)'].toString() : null,
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

            if (productBranchIds.length > 0) {
              await Promise.all(
                productBranchIds.map(branchId =>
                  supabase.from('product_branches').insert({ product_id: newProduct.id, branch_id: branchId })
                )
              );
            }

            allProducts.push(newProduct);
            successCount++;
          } else {
            if (productId) {
              try {
                await adminApi.products.update(productId.toString(), productData);

                await supabase.from('product_branches').delete().eq('product_id', productId.toString());
                if (productBranchIds.length > 0) {
                  await Promise.all(
                    productBranchIds.map(branchId =>
                      supabase.from('product_branches').insert({ product_id: productId.toString(), branch_id: branchId })
                    )
                  );
                }

                const existingIndex = allProducts.findIndex(p => p.id === productId.toString());
                if (existingIndex !== -1) {
                  allProducts[existingIndex] = { ...allProducts[existingIndex], ...productData };
                }
                successCount++;
              } catch (updateError) {
                const newProduct = await adminApi.products.create(productData);

                if (productBranchIds.length > 0) {
                  await Promise.all(
                    productBranchIds.map(branchId =>
                      supabase.from('product_branches').insert({ product_id: newProduct.id, branch_id: branchId })
                    )
                  );
                }

                allProducts.push(newProduct);
                successCount++;
              }
            } else {
              const newProduct = await adminApi.products.create(productData);

              if (productBranchIds.length > 0) {
                await Promise.all(
                  productBranchIds.map(branchId =>
                    supabase.from('product_branches').insert({ product_id: newProduct.id, branch_id: branchId })
                  )
                );
              }

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
              <li>Kategori (zorunlu) - Ana kategori adı (Türkçe)</li>
              <li>Kategori Şubeler (opsiyonel) - Ana kategorinin şubeleri</li>
              <li>Alt Kategori (opsiyonel) - Alt kategori varsa</li>
              <li>Alt Kategori Şubeler (opsiyonel) - Alt kategorinin şubeleri</li>
              <li>Ürün Adı (TR) (zorunlu)</li>
              <li>Ürün Adı (EN) (opsiyonel)</li>
              <li>Açıklama (TR)</li>
              <li>Açıklama (EN)</li>
              <li>Uyarı (TR)</li>
              <li>Uyarı (EN)</li>
              <li>Fiyat (tekli fiyat)</li>
              <li>Küçük Fiyat, Orta Fiyat, Büyük Fiyat</li>
              <li>Ürün Şubeler (virgülle ayrılmış şube isimleri)</li>
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
          <li>• Şube sütunları: Birden fazla şube için virgülle ayırın (örn: "Merkez, Bahçelievler")</li>
          <li>• Alt Kategori Şubeler boşsa, Kategori Şubeler kullanılır</li>
          <li>• Kategori şubeleri sadece yeni kategoriler için işlenir</li>
          <li>• Dil alanları: TR zorunlu, EN opsiyonel</li>
          <li>• Sıra değeri 0 ise otomatik sıra numarası atanır</li>
          <li>• Durum sütunu: "Aktif" veya "Pasif" yazılmalı</li>
        </ul>
      </div>
    </div>
  );
}
