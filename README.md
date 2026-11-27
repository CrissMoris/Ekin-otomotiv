# Ekin Otomotiv

Ekin Otomotiv projesinin kaynak kod deposu.

## Hakkında

Bu depo, Ekin Otomotiv projesine ait dosyaları içerir. Proje geliştirildikçe bu doküman güncellenecektir.

İkinci el araç alım, satım ve takas web sitesi ile yönetim paneli (Next.js + TypeScript).

- **Veriler** (araçlar ve müşteri talepleri) ücretsiz **MongoDB Atlas** veritabanında tutulur (`MONGODB_URI`).
- **Fotoğraflar** ücretsiz **Cloudinary** hesabında saklanır; veritabanına yalnızca fotoğrafın kimliği yazılır.
- Ayarlar eksik ya da hatalıysa yönetim paneli anlaşılır bir Türkçe hata mesajı gösterir.

## Kurulum ve çalıştırma

Gereksinim: [Node.js](https://nodejs.org/) 20.9 veya üzeri. Çalıştırmadan önce aşağıdaki “Kalıcı veri kurulumu” adımlarıyla `.env.local` dosyasını doldurun.

```bash
git clone https://github.com/CrissMoris/Ekin-otomotiv.git
cd Ekin-otomotiv
npm install
npm run dev
```

- Site: <http://localhost:3000>
- Yönetim paneli: <http://localhost:3000/admin> — giriş için `.env.local` dosyasındaki `ADMIN_PASSWORD` PIN'i kullanılır.

| Komut               | Açıklama                       |
| ------------------- | ------------------------------ |
| `npm run dev`       | Geliştirme sunucusu            |
| `npm run build`     | Üretim derlemesi               |
| `npm start`         | Derlenmiş sürümü çalıştırır    |
| `npm run lint`      | ESLint kontrolü                |
| `npm run typecheck` | TypeScript kontrolü            |

## Kurulum (bir kez yapılır)

### 1. MongoDB Atlas (araçlar ve talepler)

1. [MongoDB Atlas](https://www.mongodb.com/atlas)'ta ücretsiz (Free) küme oluşturun; bölge olarak **Frankfurt (eu-central-1)** seçin.
   `vercel.json` sitenin sunucu tarafını da Frankfurt'ta (`fra1`) çalıştırır.
2. **Database Access** → yeni kullanıcı (ör. `ekin-site`), parola ile; yetki: `ekin-otomotiv` veritabanında `readWrite`.
3. **Network Access** → `0.0.0.0/0` (Vercel'in sabit IP adresi yoktur).
4. **Connect → Drivers** bölümündeki adreste `<db_password>` yerine şifreyi yazıp `MONGODB_URI` olarak girin;
   `MONGODB_DB="ekin-otomotiv"`.

Koleksiyonlar: `vehicles` (`_id` = İlan No, fotoğraflar `photoIds` olarak) ve `inquiries` (`_id` = Talep No).
Ücretsiz planda otomatik yedek yoktur.

### 2. Cloudinary (fotoğraflar)

1. <https://cloudinary.com> → ücretsiz hesap açın.
2. Kontrol panelindeki tek satırlık **API environment variable** değerini `CLOUDINARY_URL=cloudinary://...` olarak girin
   (ya da `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).

### 3. Ayarları girin

Zorunlu: `ADMIN_PASSWORD` (yönetici PIN'i), `MONGODB_URI`, `MONGODB_DB` ve Cloudinary bilgileri. Canlıda ayrıca
`SESSION_SECRET` (en az 32 karakter rastgele) ve `SITE_URL` (ör. `https://www.ekinotomotiv.com`) önerilir.

- **Yerelde:** `.env.example` dosyasını `.env.local` adıyla kopyalayıp doldurun, `npm run dev` ile yeniden başlatın.
- **Vercel'de:** Project Settings → Environment Variables bölümüne aynı değişkenleri girin ve yeniden yayınlayın (Redeploy).

Ayar eksik ya da hatalıysa yönetim paneli sorunu Türkçe olarak gösterir (değişken adlarıyla; değerleri asla).

## Dil sürümleri

Site Türkçe (`/`), İngilizce (`/en`) ve Arapça (`/ar`) olarak yayınlanır; dil üst şeritteki menüden seçilir.
Araç açıklamaları girildiği dilde (Türkçe) gösterilir. İngilizce/Arapça formdan gelen talepler yönetim panelinde işaretlenir.

## Güvenlik

- Yönetici PIN'i yalnızca ortam değişkeninde tutulur, kodda veya GitHub'da yer almaz; sunucuda kontrol edilir.
- 15 dakikada 5 hatalı PIN denemesinden sonra giriş geçici olarak kilitlenir.
- Hız sınırları: talep formu 10 dakikada 5 talep; yönetim işlemleri dakikada 60; fotoğraf yükleme dakikada 40.
- Güvenlik başlıkları (CSP, X-Frame-Options, HSTS vb.) `next.config.ts` içinde tanımlıdır.
- Tarayıcıya yalnızca küçültülmüş (minify) kod gider; kaynak kod haritası gönderilmez. MongoDB ve Cloudinary
  anahtarları ile sunucu kodu hiçbir zaman tarayıcıya ulaşmaz.
- MongoDB kullanıcısına yalnızca sitenin veritabanında `readWrite` yetkisi verilir; yönetici (Atlas admin) yetkisi verilmez.

## Proje yapısı

```
app/(site)/        Herkese açık sayfalar
app/admin/         Yönetim paneli
app/api/           Sunucu uçları (talep formu, yönetici işlemleri, fotoğraf imzası)
components/        Arayüz bileşenleri
lib/store.ts       Tüm veri işlemleri (sayfalar ve API uçları yalnızca bunu kullanır)
lib/repository.ts  MongoDB okuma/yazma (araçlar, talepler)
lib/mongo.ts       MongoDB bağlantısı ve Türkçe hata mesajları
lib/cloudinary.ts  Cloudinary imza / silme / görsel adresi
lib/rate-limit.ts  Hız sınırlayıcı
public/marka/      Logo dosyaları
```
