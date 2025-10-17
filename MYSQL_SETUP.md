# MySQL Veritabanı Kurulum Kılavuzu

Uygulamanız artık MySQL veritabanı ile çalışacak şekilde yapılandırıldı.

## Veritabanı Kurulumu

### 1. MySQL Veritabanını Oluşturun

MySQL'e giriş yapın ve veritabanı şemasını içe aktarın:

```bash
mysql -u evteksti_useradi -p
```

Şifre istendiğinde: `pass`

### 2. Veritabanı Şemasını İçe Aktarın

```bash
mysql -u evteksti_useradi -p evteksti_dbadi < database/schema.sql
```

VEYA MySQL komut satırından:

```sql
SOURCE /path/to/database/schema.sql;
```

## Veritabanı Yapısı

Şema otomatik olarak şu tabloları oluşturur:

- **admin_users**: Yönetici kullanıcıları
- **branches**: Şube yönetimi
- **categories**: Ürün kategorileri
- **products**: Ürünler
- **settings**: Uygulama ayarları

## Varsayılan Admin Kullanıcı

- **Kullanıcı Adı**: admin
- **Şifre**: admin123

⚠️ **ÖNEMLİ**: Üretim ortamında bu şifreyi mutlaka değiştirin!

## Sunucuyu Başlatma

```bash
npm run start
```

Sunucu `http://localhost:3000` adresinde çalışacaktır.

## Ortam Değişkenleri

`.env` dosyasında aşağıdaki MySQL bağlantı bilgileri ayarlanmıştır:

```
DB_HOST=localhost
DB_USER=evteksti_useradi
DB_PASSWORD=pass
DB_NAME=evteksti_dbadi
DB_PORT=3306
```

Bu bilgileri kendi MySQL ayarlarınıza göre düzenleyebilirsiniz.

## Admin Panel

Admin paneline erişim: `http://localhost:3000/admin`

## Notlar

- Tüm Supabase bağımlılıkları kaldırıldı
- Kimlik doğrulama JWT token tabanlı
- Resim yüklemeleri yerel `/uploads/img` dizinine yapılır
- API endpoint'leri `/api` prefix'i ile çalışır
