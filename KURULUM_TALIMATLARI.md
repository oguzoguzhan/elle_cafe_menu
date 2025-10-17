# Kurulum Talimatları

## 1. Veritabanı Kurulumu

MySQL veritabanınıza bağlanın ve `database/schema.sql` dosyasını çalıştırın:

```bash
mysql -h ellecafe.tr -u evteksti_qruser -p evteksti_qrdb < database/schema.sql
```

Şifre: `Oguz6489-+`

Bu işlem şunları yapacak:
- Gerekli tabloları oluşturacak (admin_users, branches, categories, products, settings)
- Varsayılan admin kullanıcısı oluşturacak (admin / admin123)
- Varsayılan ayarları ekleyecek

## 2. Bağımlılıkları Yükleme

```bash
npm install
```

## 3. Sunucuyu Başlatma

```bash
npm run start
```

Sunucu http://localhost:3000 adresinde çalışacaktır.

## 4. Uygulamayı Kullanma

- **Ana Sayfa**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Admin Kullanıcı**: admin
- **Admin Şifre**: admin123

## Sorun Giderme

### "Yükleniyor..." sayfasında kalıyor

1. Tarayıcı konsolunu açın (F12) ve hata mesajlarını kontrol edin
2. Sunucu loglarını kontrol edin
3. Veritabanı bağlantısının doğru olduğundan emin olun:
   ```bash
   mysql -h ellecafe.tr -u evteksti_qruser -p evteksti_qrdb -e "SHOW TABLES;"
   ```

4. API endpoint'lerinin çalıştığını test edin:
   ```bash
   curl http://localhost:3000/api/settings
   ```

### Veritabanı Bağlantı Hatası

.env dosyasındaki bağlantı bilgilerini kontrol edin:
```
DB_HOST=ellecafe.tr
DB_USER=evteksti_qruser
DB_PASSWORD=Oguz6489-+
DB_NAME=evteksti_qrdb
DB_PORT=3306
```

### Build Hatası

```bash
npm run build
```

Komutunu çalıştırıp hataları kontrol edin.

## Üretim Ortamına Deployment

1. Önce uygulamayı build edin:
   ```bash
   npm run build
   ```

2. `.env` dosyasındaki `VITE_API_URL` değerini production URL'iniz ile güncelleyin:
   ```
   VITE_API_URL=https://yourdomain.com/api
   ```

3. Build'i tekrar çalıştırın:
   ```bash
   npm run build
   ```

4. `dist` klasörünü ve `server.js` ile birlikte sunucunuza yükleyin

5. Sunucuda başlatın:
   ```bash
   node server.js
   ```
