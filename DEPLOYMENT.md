# 📦 Deployment Talimatları

## Resimleri Kendi Hostunuzda Barındırma

Resimler artık `uploads/img/` klasörüne yüklenecek.

---

## 🚀 Kurulum Adımları

### 1. Projeyi Export Edin
- Bolt'tan projeyi indirin (Download/Export)

### 2. cPanel'de Klasör Yapısını Oluşturun

```
public_html/
├── uploads/
│   └── img/              # Resimler buraya kaydedilecek
│       ├── .htaccess     # Güvenlik ayarları
│       └── index.html    # Klasör erişimini engeller
├── server/
│   ├── upload.php        # Resim yükleme API
│   ├── delete.php        # Resim silme API
│   └── .htaccess         # URL rewrite kuralları
└── (diğer dosyalar)
```

### 3. Dosyaları Yükleyin

**FileZilla veya cPanel File Manager ile:**

1. `server/` klasörünü → `public_html/server/` olarak yükleyin
2. `uploads/` klasörünü → `public_html/uploads/` olarak yükleyin
3. Build edilmiş frontend dosyalarını → `public_html/` e yükleyin

### 4. Klasör İzinlerini Ayarlayın

cPanel File Manager'da:

```
uploads/img/  → 755 izni (Read/Write/Execute)
server/       → 755 izni
```

Veya SSH ile:
```bash
chmod -R 755 public_html/uploads/img
chmod -R 755 public_html/server
```

### 5. .htaccess Dosyasını Root'a Ekleyin

`public_html/.htaccess` dosyasına ekleyin:

```apache
RewriteEngine On
RewriteBase /

# API endpoints
RewriteRule ^api/upload$ server/upload.php [L]
RewriteRule ^api/delete$ server/delete.php [L]

# Frontend routing (React Router için)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

---

## 🧪 Test Edin

### 1. Resim Yükleme Test:
```bash
curl -X POST -F "image=@test.jpg" -F "filename=test_123.jpg" \
  https://your-domain.com/api/upload
```

Beklenen yanıt:
```json
{
  "url": "https://your-domain.com/uploads/img/1234567890_123456789.jpg"
}
```

### 2. Tarayıcıdan Test:
- Admin panele giriş yapın
- Ürün/kategori ekleyin
- Resim yükleyin
- Resmin `uploads/img/` klasöründe göründüğünü kontrol edin

---

## 🔒 Güvenlik Özellikleri

✅ **Dosya Tipi Kontrolü:** Sadece resim dosyaları (.jpg, .png, .gif, .webp)
✅ **Boyut Limiti:** Maximum 5MB
✅ **PHP Çalıştırma Engeli:** `.htaccess` ile PHP execution disabled
✅ **Klasör Listeleme Engeli:** `index.html` ile korunmuş
✅ **CORS Desteği:** Tüm origin'lere izin (gerekirse kısıtlayabilirsiniz)

---

## 📊 Veritabanı

Veritabanı **Supabase**'de kalacak. Sadece resimler kendi hostunuzda:

- ✅ Kategoriler → Supabase
- ✅ Ürünler → Supabase
- ✅ Ayarlar → Supabase
- ✅ Authentication → Supabase
- 📸 **Resimler → Kendi hostunuz** (`uploads/img/`)

---

## 🛠️ Sorun Giderme

### "Failed to save file" hatası:
```bash
# İzinleri kontrol edin
chmod -R 755 public_html/uploads/img
```

### "404 Not Found" hatası:
```bash
# .htaccess dosyasının doğru yerde olduğunu kontrol edin
# Apache mod_rewrite'ın aktif olduğunu doğrulayın
```

### Resimler yüklenmiyor:
1. `php.ini` dosyasında `upload_max_filesize` değerini kontrol edin
2. `post_max_size` değerini kontrol edin
3. cPanel → PHP Settings'den ayarlayabilirsiniz

---

## 📱 İsteğe Bağlı: CDN Ekleme

Cloudflare gibi bir CDN kullanırsanız:

1. Domain'i Cloudflare'e ekleyin
2. DNS ayarlarını yapın
3. `/uploads/img/*` path'ini cache'leyin
4. Resimler otomatik olarak CDN üzerinden sunulacak

---

## 💾 Yedekleme

Resimleri düzenli yedekleyin:

**cPanel Backup:**
- cPanel → Backup → Download a Full Backup

**SSH ile:**
```bash
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public_html/uploads/img/
```

---

## ✅ Tamamlandı!

Artık resimler `https://your-domain.com/uploads/img/` adresinde barındırılıyor.

Frontend kodu otomatik olarak `/api/upload` endpoint'ini kullanıyor.
