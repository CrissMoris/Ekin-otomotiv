# Ekin Otomotiv

Ekin Otomotiv projesinin kaynak kod deposu.

## Hakkında

Bu depo, Ekin Otomotiv projesine ait dosyaları içerir. Proje geliştirildikçe bu doküman güncellenecektir.

İkinci el araç alım, satım ve takas web sitesi ile yönetim paneli (Next.js + TypeScript).

- **Veriler** (araçlar ve müşteri talepleri) ücretsiz bir **Google Sheets** dosyasında kalıcı olarak tutulur. Ayrı bir veritabanı yoktur.
- **Fotoğraflar** ücretsiz **Cloudinary** hesabında saklanır; Sheets'e yalnızca fotoğrafın kimliği yazılır.
- Site çalışmak için Google Sheets ve Cloudinary ayarlarına ihtiyaç duyar; ayarlar eksikse anlaşılır bir hata mesajı gösterir.

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

## Kalıcı veri kurulumu (bir kez yapılır)

### 1. Google Sheets dosyası

1. <https://sheets.google.com> → boş bir dosya açın.
2. **Dosya → İçe aktar → Yükle** ile `kurulum/google-sheets-sablonu.xlsx` dosyasını seçin, “E-tabloyu değiştir” deyin.
   Dosyada `Araclar` ve `Talepler` adlı iki sekme ve başlık satırları hazır gelir.
3. Adres çubuğundaki `/d/` ile `/edit` arasındaki kodu kopyalayın → `GOOGLE_SHEET_ID`.

### 2. Google servis hesabı (sitenin Sheets'e erişmesi için)

1. <https://console.cloud.google.com> → yeni proje oluşturun (ör. “ekin-otomotiv”).
2. **API'ler ve Hizmetler → Kitaplık** → “Google Sheets API” → **Etkinleştir**.
3. **IAM ve Yönetici → Hizmet Hesapları → Hizmet hesabı oluştur** (rol vermeniz gerekmez).
4. Hesaba tıklayın → **Anahtarlar → Anahtar ekle → JSON**. İnen dosyayı kimseyle paylaşmayın.
5. JSON dosyasındaki `client_email` → `GOOGLE_CLIENT_EMAIL`, `private_key` → `GOOGLE_PRIVATE_KEY`.
6. Sheets dosyasında **Paylaş** → `client_email` adresini **Düzenleyici** olarak ekleyin.

> Şirket (Google Workspace) hesabı kullanıyorsanız anahtar oluşturma kurum yöneticisi tarafından kapatılmış olabilir.

### 3. Cloudinary (fotoğraflar)

1. <https://cloudinary.com> → ücretsiz hesap açın.
2. Kontrol panelindeki **Cloud name**, **API Key**, **API Secret** → `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   Alternatif: paneldeki tek satırlık **API environment variable** değerini `CLOUDINARY_URL=cloudinary://...` olarak yapıştırın.

### 4. Ayarları girin

Zorunlu: `ADMIN_PASSWORD` (yönetici PIN'i). Canlıda ayrıca `SESSION_SECRET` (en az 32 karakter rastgele) ve `SITE_URL`
(ör. `https://www.ekinotomotiv.com`) girilmesi önerilir.

- **Yerelde:** `.env.example` dosyasını `.env.local` adıyla kopyalayıp doldurun, `npm run dev` ile yeniden başlatın.
- **Vercel'de:** Project Settings → Environment Variables bölümüne aynı değişkenleri girin ve yeniden yayınlayın (Redeploy).

### 5. Bağlantıyı test edin

```bash
npm run baglanti-testi
```

Yalnızca okuma yapar, Sheets'teki verileri değiştirmez ve anahtarları ekrana yazmaz. Google girişini, Sheets dosyasının
paylaşımını, `Araclar` / `Talepler` sekmelerini ve başlıklarını, Cloudinary bilgilerini tek tek kontrol eder; sorun varsa
ne yapılacağını Türkçe yazar.

> Servis hesabı JSON dosyasını proje içinde tutmanız gerekirse `gizli/` klasörüne koyun; bu klasör Git'e eklenmez.

## Sheets'i elle düzenlerken

- Yeni aracı ve fotoğrafları **yönetim panelinden** ekleyin (İlan No ve fotoğraflar otomatik oluşur).
- Fiyat, kilometre, açıklama ve “Durum” (Yayında / Taslak) Sheets'ten de değiştirilebilir. Site değişikliği en geç ~1 dakikada gösterir; panelden yapılan değişiklikler anında görünür.
- **İlan No** sütununu ve **başlık satırını** değiştirmeyin. Satırların sırası önemli değildir.
- Hatalı/eksik bir satır sitede gösterilmez; yönetim paneli hangi satırda sorun olduğunu yazar.
- Talepler `Talepler` sekmesine düşer; “Durum” sütununu (Yeni, Arandı, Kapandı…) takip için kullanabilirsiniz.

## Güvenlik

- Yönetici PIN'i yalnızca ortam değişkeninde tutulur, kodda veya GitHub'da yer almaz; sunucuda kontrol edilir.
- 15 dakikada 5 hatalı PIN denemesinden sonra giriş geçici olarak kilitlenir.
- Hız sınırları: talep formu 10 dakikada 5 talep; yönetim işlemleri dakikada 60; fotoğraf yükleme dakikada 40.
- Güvenlik başlıkları (CSP, X-Frame-Options, HSTS vb.) `next.config.ts` içinde tanımlıdır.
- Tarayıcıya yalnızca küçültülmüş (minify) kod gider; kaynak kod haritası gönderilmez. Google ve Cloudinary
  anahtarları ile sunucu kodu hiçbir zaman tarayıcıya ulaşmaz.

## Proje yapısı

```
app/(site)/        Herkese açık sayfalar
app/admin/         Yönetim paneli
app/api/           Sunucu uçları (talep formu, yönetici işlemleri, fotoğraf imzası)
components/        Arayüz bileşenleri
lib/store.ts       Tüm veri işlemleri (Google Sheets)
lib/sheets.ts      Google Sheets bağlantısı
lib/cloudinary.ts  Cloudinary imza / silme / görsel adresi
lib/rate-limit.ts  Hız sınırlayıcı
public/marka/      Logo dosyaları
kurulum/           Google Sheets şablonu
```
