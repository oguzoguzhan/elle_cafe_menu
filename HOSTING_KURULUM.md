# 🚀 Hosting Kurulum Rehberi (MySQL + Node.js)

## ✅ Gereksinimler
- Node.js 18+ desteği olan hosting
- MySQL veritabanı (zaten hazır: evteksti_qrdb)
- SSH erişimi veya cPanel Terminal
- PM2 veya Forever gibi process manager

---

## 📦 1. Dosyaları Hostinge Yükleme

### FileZilla veya cPanel File Manager ile:

```
/home/evteksti/
├── qrmenu/                    # Ana uygulama klasörü
│   ├── server.js              # Node.js sunucu
│   ├── server/                # API routes
│   ├── dist/                  # Build edilmiş frontend (npm run build sonrası)
│   ├── uploads/               # Yüklenen resimler
│   ├── package.json
│   ├── .env                   # Veritabanı bilgileri
│   └── node_modules/          # Dependencies
└── public_html/               # Apache web root
    └── .htaccess              # Reverse proxy ayarları
```

---

## 🔧 2. .env Dosyasını Ayarlayın

`/home/evteksti/qrmenu/.env` dosyası:

```env
DB_HOST=localhost
DB_USER=evteksti_qruser
DB_PASSWORD=Oguz6489-+
DB_NAME=evteksti_qrdb
DB_PORT=3306

JWT_SECRET=your-secret-jwt-key-change-in-production
SESSION_SECRET=your-secret-session-key-change-in-production

PORT=3000
```

**ÖNEMLİ:** Host içindeyken `DB_HOST=localhost` kullanın!

---

## 📊 3. Veritabanı Tablolarını Oluşturun

SSH veya cPanel Terminal ile:

```bash
cd /home/evteksti/qrmenu
mysql -u evteksti_qruser -p'Oguz6489-+' evteksti_qrdb < database/schema.sql
```

Veya cPanel → phpMyAdmin'den `database/schema.sql` dosyasını import edin.

---

## 🏗️ 4. Node.js Bağımlılıklarını Yükleyin

SSH ile:

```bash
cd /home/evteksti/qrmenu
npm install --production
```

---

## 🎨 5. Frontend'i Build Edin

Kendi bilgisayarınızda:

```bash
npm run build
```

`dist/` klasörünü hostinge yükleyin: `/home/evteksti/qrmenu/dist/`

---

## 🚦 6. Node.js Sunucusunu Başlatın

### PM2 ile (Önerilen):

```bash
npm install -g pm2
cd /home/evteksti/qrmenu
pm2 start server.js --name "qrmenu"
pm2 save
pm2 startup
```

### Forever ile:

```bash
npm install -g forever
cd /home/evteksti/qrmenu
forever start server.js
```

### Basit yöntem (test için):

```bash
nohup node server.js > output.log 2>&1 &
```

---

## 🌐 7. Apache Reverse Proxy Ayarları

`/home/evteksti/public_html/.htaccess` dosyası:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # API isteklerini Node.js'e yönlendir
  RewriteCond %{REQUEST_URI} ^/api/
  RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]

  # Statik dosyalar ve resimler
  RewriteCond %{REQUEST_URI} ^/uploads/
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f
  RewriteRule ^ - [L]

  # Frontend routing - tüm diğer istekler
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

**Alternatif:** `dist/` klasörü varsa:

```apache
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /dist/index.html [L]
```

---

## 📁 8. Klasör İzinlerini Ayarlayın

```bash
chmod -R 755 /home/evteksti/qrmenu/uploads
chmod 600 /home/evteksti/qrmenu/.env
```

---

## 🧪 9. Test Edin

### Sunucu kontrolü:
```bash
curl http://localhost:3000/api/settings
```

### Tarayıcıdan:
```
https://ellecafe.tr/admin/login
```

---

## 🔄 10. Güncelleme Yapmak İçin

```bash
cd /home/evteksti/qrmenu

# Sunucuyu durdur
pm2 stop qrmenu

# Yeni dosyaları yükle (FTP ile)

# Bağımlılıkları güncelle
npm install --production

# Frontend'i yeniden build et (gerekirse)

# Sunucuyu başlat
pm2 start qrmenu
```

---

## 🛠️ Sorun Giderme

### Node.js çalışmıyor:
```bash
pm2 logs qrmenu
# veya
tail -f /home/evteksti/qrmenu/output.log
```

### Veritabanı bağlantı hatası:
- `.env` dosyasında `DB_HOST=localhost` olmalı
- MySQL kullanıcısının local erişim izni olmalı

### 502 Bad Gateway:
- Node.js sunucusunun çalıştığını kontrol edin: `pm2 status`
- Port 3000'in açık olduğunu kontrol edin: `netstat -tuln | grep 3000`

### Resimler yüklenmiyor:
```bash
chmod -R 755 /home/evteksti/qrmenu/uploads
```

---

## ✅ Başarılı Kurulum Kontrol Listesi

- [ ] MySQL veritabanı tabloları oluşturuldu
- [ ] `.env` dosyası doğru ayarlandı (DB_HOST=localhost)
- [ ] Node.js bağımlılıkları yüklendi
- [ ] Frontend build edildi ve dist/ klasörü yüklendi
- [ ] Node.js sunucu çalışıyor (PM2/Forever ile)
- [ ] Apache .htaccess reverse proxy yapılandırıldı
- [ ] uploads/ klasörü yazılabilir (755)
- [ ] Admin panele giriş yapılabiliyor
- [ ] Kategori/ürün ekleme çalışıyor
- [ ] Resim yükleme çalışıyor

---

## 📞 Hosting Desteği

cPanel'de Node.js desteği yoksa:
1. Hosting sağlayıcınızdan Node.js aktivasyonu isteyin
2. Alternatif: VPS veya cloud hosting kullanın (DigitalOcean, AWS, Linode)
3. Veya: Supabase gibi servislere geçin (daha kolay)
