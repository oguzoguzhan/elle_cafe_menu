# MySQL Deployment Talimatları

Proje artık **kendi hostunuzda MySQL veritabanı** kullanacak şekilde yapılandırıldı.

---

## 🗄️ Veritabanı Kurulumu

### 1. MySQL Veritabanı Oluşturun

cPanel → MySQL Databases:
1. Yeni veritabanı oluşturun (örn: `mydb_catalog`)
2. Yeni kullanıcı oluşturun (örn: `mydb_user`)
3. Kullanıcıya veritabanı için TÜM YETKİLERİ verin

### 2. Veritabanı Tabloları Oluşturun

**Yöntem 1: phpMyAdmin ile**
1. cPanel → phpMyAdmin
2. Veritabanınızı seçin
3. "SQL" sekmesine gidin
4. `database/schema.sql` dosyasının içeriğini kopyalayıp yapıştırın
5. "Go" butonuna tıklayın

**Yöntem 2: SSH ile**
```bash
mysql -u mydb_user -p mydb_catalog < database/schema.sql
```

### 3. Veritabanı Ayarlarını Yapın

`server/config.php` dosyasını düzenleyin:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'mydb_catalog');      // Veritabanı adınız
define('DB_USER', 'mydb_user');         // Kullanıcı adınız
define('DB_PASS', 'your_password');     // Şifreniz
```

---

## 📦 Dosya Yapısı

Hostunuza yüklenecek dosyalar:

```
public_html/
├── database/
│   └── schema.sql          # Veritabanı şeması (bu dosyayı yüklemek opsiyonel)
├── server/
│   ├── config.php          # Veritabanı bağlantı ayarları
│   ├── auth.php            # Login/logout API
│   ├── categories.php      # Kategori CRUD API
│   ├── products.php        # Ürün CRUD API
│   ├── settings.php        # Ayarlar API
│   ├── upload.php          # Resim yükleme API
│   ├── delete.php          # Resim silme API
│   └── .htaccess           # Güvenlik ayarları
├── uploads/
│   └── img/                # Resimler buraya kaydedilecek
│       ├── .htaccess       # Güvenlik
│       └── index.html      # Klasör koruması
├── .htaccess               # URL rewrite kuralları
└── (dist klasöründeki build dosyaları)
```

---

## 🚀 Deployment Adımları

### 1. Projeyi Build Edin

Yerel bilgisayarınızda:
```bash
npm run build
```

### 2. Dosyaları cPanel'e Yükleyin

FileZilla veya cPanel File Manager ile:

1. **server/** klasörünü → `public_html/server/` e yükleyin
2. **database/** klasörünü → `public_html/database/` e yükleyin (opsiyonel)
3. **uploads/** klasörünü → `public_html/uploads/` e yükleyin
4. **.htaccess** dosyasını → `public_html/.htaccess` e yükleyin
5. **dist/** içindeki tüm dosyaları → `public_html/` e yükleyin

### 3. Klasör İzinlerini Ayarlayın

```bash
chmod -R 755 public_html/uploads/img
chmod -R 755 public_html/server
```

### 4. server/config.php Düzenleyin

Veritabanı bilgilerinizi girin:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
```

---

## 🔐 Varsayılan Admin Hesabı

İlk giriş için:
- **Kullanıcı adı:** `admin`
- **Şifre:** `admin123`

**ÖNEMLİ:** İlk girişten sonra mutlaka şifreyi değiştirin!

Şifre değiştirmek için:
```sql
UPDATE admin_users
SET password_hash = '$2a$10$YourNewBcryptHashHere'
WHERE username = 'admin';
```

Bcrypt hash oluşturmak için: https://bcrypt-generator.com/

---

## 🧪 Test Edin

### 1. Veritabanı Bağlantısı Test

Tarayıcıda:
```
https://your-domain.com/api/settings
```

Başarılı ise ayarları JSON formatında göreceksiniz.

### 2. Admin Panele Giriş

```
https://your-domain.com/admin
```

Kullanıcı: `admin`
Şifre: `admin123`

### 3. Resim Yükleme Test

Admin panelden:
1. Settings → Logo yükleyin
2. Categories → Kategori ekleyin ve resim yükleyin
3. Products → Ürün ekleyin ve resim yükleyin

---

## 📊 Veritabanı Şeması

### Tablolar

#### `settings`
- Site ayarları (renkler, logolar, grid yapısı)
- Tek satır içerir

#### `categories`
- Ürün kategorileri
- `sort_order` ile sıralama

#### `products`
- Ürünler
- Her ürün bir kategoriye bağlı
- `category_id` foreign key

#### `admin_users`
- Admin kullanıcılar
- Şifreler bcrypt ile hashlenmiş

---

## 🔒 Güvenlik Özellikleri

✅ **Session tabanlı authentication** - PHP session ile güvenli giriş
✅ **Bcrypt password hashing** - Şifreler güvenli şekilde saklanır
✅ **Prepared statements** - SQL injection koruması
✅ **Input validation** - Tüm girdiler kontrol edilir
✅ **File upload security** - Sadece resim dosyaları
✅ **CORS headers** - Cross-origin istekler kontrollü

---

## 🛠️ Sorun Giderme

### "Database connection failed" hatası
```bash
# config.php dosyasındaki bilgileri kontrol edin
# cPanel → MySQL Databases → kullanıcı yetkilerini kontrol edin
```

### "Table doesn't exist" hatası
```bash
# schema.sql dosyasını tekrar çalıştırın
# phpMyAdmin → Import → schema.sql seçin
```

### Resimler yüklenmiyor
```bash
# İzinleri kontrol edin
chmod -R 755 public_html/uploads/img

# .htaccess dosyasının doğru yerde olduğunu kontrol edin
```

### Admin panele giriş yapamıyorum
```bash
# Veritabanını kontrol edin
SELECT * FROM admin_users;

# Varsayılan admin kullanıcısı yoksa tekrar ekleyin
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$rZ8qNYxVQXyEK.zG5qYvK.Ym4LGvH6F8JKj5p3nK4TyXwZY9bC8pK');
```

### Session çalışmıyor
```php
// php.ini dosyasında session ayarlarını kontrol edin
session.save_path = "/tmp"
session.gc_maxlifetime = 1440
```

---

## 💾 Yedekleme

### Veritabanı Yedekleme

**cPanel ile:**
1. cPanel → phpMyAdmin
2. Veritabanınızı seçin
3. Export → Go

**SSH ile:**
```bash
mysqldump -u mydb_user -p mydb_catalog > backup.sql
```

### Resim Yedekleme

```bash
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public_html/uploads/img/
```

---

## 📈 Performans İpuçları

1. **Veritabanı Index'leri:** Schema zaten optimize edilmiş index'lere sahip
2. **PHP OPcache:** cPanel → PHP Settings → OPcache'i aktif edin
3. **Gzip Compression:** .htaccess dosyasında zaten aktif
4. **CDN:** Cloudflare gibi ücretsiz CDN kullanın

---

## ✅ Tamamlandı!

Artık uygulamanız kendi hostunuzdaki MySQL veritabanını kullanıyor.

- ✅ Veritabanı → Kendi MySQL sunucunuz
- ✅ Resimler → `uploads/img/` klasörü
- ✅ API → PHP backend
- ✅ Authentication → Session tabanlı
- ✅ Frontend → React (static files)

Herhangi bir sorun yaşarsanız, loglara bakın:
- PHP errors: `public_html/error_log`
- Browser console: DevTools → Console
