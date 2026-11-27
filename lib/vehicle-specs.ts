// Araç ek bilgileri, ekspertiz (boya/değişen) ve donanım özellikleri.
// Hem yönetim panelinde hem sitede (Türkçe/İngilizce/Arapça) kullanılır.

type Label = { tr: string; en: string; ar: string };

export const BODY_TYPE_LABELS = {
  sedan: { tr: "Sedan", en: "Sedan", ar: "سيدان" },
  hatchback: { tr: "Hatchback", en: "Hatchback", ar: "هاتشباك" },
  suv: { tr: "SUV", en: "SUV", ar: "SUV" },
  "station-wagon": { tr: "Station Wagon", en: "Station Wagon", ar: "ستيشن واغن" },
  coupe: { tr: "Coupe", en: "Coupe", ar: "كوبيه" },
  cabrio: { tr: "Cabrio", en: "Convertible", ar: "مكشوفة (كابريو)" },
  mpv: { tr: "MPV", en: "MPV", ar: "MPV عائلية" },
  minivan: { tr: "Minivan", en: "Minivan", ar: "ميني فان" },
  pickup: { tr: "Pick-up", en: "Pick-up", ar: "بيك أب" },
  panelvan: { tr: "Panelvan", en: "Panel van", ar: "فان" },
} satisfies Record<string, Label>;
export type BodyType = keyof typeof BODY_TYPE_LABELS;
export const BODY_TYPES = Object.keys(BODY_TYPE_LABELS) as BodyType[];

export const DRIVETRAIN_LABELS = {
  onden: { tr: "Önden çekiş", en: "Front-wheel drive", ar: "دفع أمامي" },
  arkadan: { tr: "Arkadan itiş", en: "Rear-wheel drive", ar: "دفع خلفي" },
  "4x4": { tr: "4x4", en: "All-wheel drive (4x4)", ar: "دفع رباعي 4x4" },
} satisfies Record<string, Label>;
export type Drivetrain = keyof typeof DRIVETRAIN_LABELS;
export const DRIVETRAINS = Object.keys(DRIVETRAIN_LABELS) as Drivetrain[];

export const TRADE_LABELS = {
  evet: { tr: "Uygun", en: "Available", ar: "متاحة" },
  hayir: { tr: "Uygun değil", en: "Not available", ar: "غير متاحة" },
} satisfies Record<string, Label>;
export type TradeOption = keyof typeof TRADE_LABELS;

export const HEAVY_DAMAGE_LABELS = {
  yok: { tr: "Yok", en: "None", ar: "لا يوجد" },
  var: { tr: "Var", en: "Yes", ar: "يوجد" },
} satisfies Record<string, Label>;
export type HeavyDamageOption = keyof typeof HEAVY_DAMAGE_LABELS;

/** Sık kullanılan renkler (panelde öneri listesi, sitede İngilizce/Arapça karşılığı). */
export const COLOR_LABELS: Record<string, { en: string; ar: string }> = {
  Beyaz: { en: "White", ar: "أبيض" },
  Siyah: { en: "Black", ar: "أسود" },
  Gri: { en: "Grey", ar: "رمادي" },
  Gümüş: { en: "Silver", ar: "فضي" },
  Füme: { en: "Smoke grey", ar: "رمادي داكن" },
  Kırmızı: { en: "Red", ar: "أحمر" },
  Bordo: { en: "Burgundy", ar: "عنابي" },
  Mavi: { en: "Blue", ar: "أزرق" },
  Lacivert: { en: "Navy blue", ar: "كحلي" },
  Yeşil: { en: "Green", ar: "أخضر" },
  Kahverengi: { en: "Brown", ar: "بني" },
  Bej: { en: "Beige", ar: "بيج" },
  Sarı: { en: "Yellow", ar: "أصفر" },
  Turuncu: { en: "Orange", ar: "برتقالي" },
  Mor: { en: "Purple", ar: "بنفسجي" },
};

// ---------------------------------------------------------------------------
// Ekspertiz (boya / değişen)
// ---------------------------------------------------------------------------

export const BODY_PARTS = {
  "on-tampon": { tr: "Ön tampon", en: "Front bumper", ar: "الصدام الأمامي" },
  kaput: { tr: "Motor kaputu", en: "Bonnet", ar: "غطاء المحرك" },
  tavan: { tr: "Tavan", en: "Roof", ar: "السقف" },
  bagaj: { tr: "Bagaj kapağı", en: "Boot lid", ar: "غطاء الصندوق الخلفي" },
  "arka-tampon": { tr: "Arka tampon", en: "Rear bumper", ar: "الصدام الخلفي" },
  "sol-on-camurluk": { tr: "Sol ön çamurluk", en: "Left front fender", ar: "الرفرف الأمامي الأيسر" },
  "sol-on-kapi": { tr: "Sol ön kapı", en: "Left front door", ar: "الباب الأمامي الأيسر" },
  "sol-arka-kapi": { tr: "Sol arka kapı", en: "Left rear door", ar: "الباب الخلفي الأيسر" },
  "sol-arka-camurluk": { tr: "Sol arka çamurluk", en: "Left rear fender", ar: "الرفرف الخلفي الأيسر" },
  "sag-on-camurluk": { tr: "Sağ ön çamurluk", en: "Right front fender", ar: "الرفرف الأمامي الأيمن" },
  "sag-on-kapi": { tr: "Sağ ön kapı", en: "Right front door", ar: "الباب الأمامي الأيمن" },
  "sag-arka-kapi": { tr: "Sağ arka kapı", en: "Right rear door", ar: "الباب الخلفي الأيمن" },
  "sag-arka-camurluk": { tr: "Sağ arka çamurluk", en: "Right rear fender", ar: "الرفرف الخلفي الأيمن" },
} satisfies Record<string, Label>;
export type BodyPart = keyof typeof BODY_PARTS;
export const BODY_PART_KEYS = Object.keys(BODY_PARTS) as BodyPart[];

export const PART_STATES = {
  orijinal: { tr: "Orijinal", en: "Original", ar: "أصلي", color: "#dde1e6", ink: "#1c1d1f", abbr: { tr: "", en: "", ar: "" } },
  "lokal-boyali": { tr: "Lokal boyalı", en: "Locally painted", ar: "طلاء جزئي", color: "#f2b632", ink: "#1c1d1f", abbr: { tr: "LB", en: "LP", ar: "ج" } },
  boyali: { tr: "Boyalı", en: "Painted", ar: "مطلي", color: "#3b78bd", ink: "#ffffff", abbr: { tr: "B", en: "P", ar: "ط" } },
  degismis: { tr: "Değişmiş", en: "Replaced", ar: "مُستبدل", color: "#c8312c", ink: "#ffffff", abbr: { tr: "D", en: "R", ar: "م" } },
} satisfies Record<string, Label & { color: string; ink: string; abbr: Label }>;
export type PartState = keyof typeof PART_STATES;
export const PART_STATE_KEYS = Object.keys(PART_STATES) as PartState[];

/** Parça → durum. Belirtilmeyen parça listede yer almaz. */
export type Inspection = Partial<Record<BodyPart, PartState>>;

// ---------------------------------------------------------------------------
// Donanım özellikleri
// ---------------------------------------------------------------------------

export const FEATURE_GROUPS = {
  guvenlik: {
    tr: "Güvenlik",
    en: "Safety",
    ar: "الأمان",
    items: {
      abs: { tr: "ABS", en: "ABS", ar: "نظام منع انغلاق المكابح (ABS)" },
      esp: { tr: "ESP / Denge kontrolü", en: "ESP / Stability control", ar: "نظام التحكم بالثبات (ESP)" },
      asr: { tr: "Çekiş kontrolü (ASR)", en: "Traction control (ASR)", ar: "نظام التحكم بالجر (ASR)" },
      "airbag-surucu": { tr: "Sürücü hava yastığı", en: "Driver airbag", ar: "وسادة هوائية للسائق" },
      "airbag-yolcu": { tr: "Yolcu hava yastığı", en: "Passenger airbag", ar: "وسادة هوائية للراكب" },
      "airbag-yan": { tr: "Yan hava yastıkları", en: "Side airbags", ar: "وسائد هوائية جانبية" },
      "airbag-perde": { tr: "Perde hava yastıkları", en: "Curtain airbags", ar: "وسائد هوائية ستارية" },
      isofix: { tr: "ISOFIX", en: "ISOFIX", ar: "نقاط تثبيت ISOFIX لمقاعد الأطفال" },
      serit: { tr: "Şerit takip sistemi", en: "Lane keeping assist", ar: "نظام البقاء في المسار" },
      "kor-nokta": { tr: "Kör nokta uyarısı", en: "Blind spot warning", ar: "تنبيه النقطة العمياء" },
      "acil-fren": { tr: "Otonom acil fren", en: "Autonomous emergency braking", ar: "الكبح الآلي في حالات الطوارئ" },
      yokus: { tr: "Yokuş kalkış desteği", en: "Hill start assist", ar: "مساعد الانطلاق على المرتفعات" },
      "lastik-basinc": { tr: "Lastik basınç sensörü", en: "Tyre pressure monitoring", ar: "حساس ضغط الإطارات" },
      yorgunluk: { tr: "Yorgunluk uyarı sistemi", en: "Driver fatigue warning", ar: "نظام التنبيه من الإرهاق" },
      "park-on": { tr: "Ön park sensörü", en: "Front parking sensors", ar: "حساسات ركن أمامية" },
      "park-arka": { tr: "Arka park sensörü", en: "Rear parking sensors", ar: "حساسات ركن خلفية" },
      "geri-kamera": { tr: "Geri görüş kamerası", en: "Rear-view camera", ar: "كاميرا خلفية" },
      "kamera-360": { tr: "360° kamera", en: "360° camera", ar: "كاميرا 360 درجة" },
      immobilizer: { tr: "Immobilizer", en: "Immobiliser", ar: "نظام منع تشغيل المحرك (Immobilizer)" },
      "merkezi-kilit": { tr: "Merkezi kilit", en: "Central locking", ar: "قفل مركزي" },
      alarm: { tr: "Alarm", en: "Alarm", ar: "نظام إنذار" },
    },
  },
  ic: {
    tr: "İç Donanım",
    en: "Interior",
    ar: "التجهيزات الداخلية",
    items: {
      "klima-otomatik": { tr: "Otomatik klima", en: "Automatic climate control", ar: "تكييف أوتوماتيكي" },
      "klima-manuel": { tr: "Manuel klima", en: "Manual air conditioning", ar: "تكييف يدوي" },
      "deri-koltuk": { tr: "Deri koltuk", en: "Leather seats", ar: "مقاعد جلدية" },
      "kumas-koltuk": { tr: "Kumaş koltuk", en: "Fabric seats", ar: "مقاعد قماشية" },
      "koltuk-elektrikli": { tr: "Elektrikli koltuk ayarı", en: "Power-adjustable seats", ar: "مقاعد بضبط كهربائي" },
      "koltuk-isitma": { tr: "Isıtmalı koltuklar", en: "Heated seats", ar: "مقاعد مُدفأة" },
      "koltuk-hafiza": { tr: "Hafızalı koltuk", en: "Memory seats", ar: "مقاعد بذاكرة" },
      "hiz-sabitleyici": { tr: "Hız sabitleyici", en: "Cruise control", ar: "مثبت السرعة" },
      "adaptif-hiz": { tr: "Adaptif hız sabitleyici", en: "Adaptive cruise control", ar: "مثبت سرعة تكيفي" },
      "start-stop": { tr: "Start/Stop sistemi", en: "Start/Stop system", ar: "نظام إيقاف وتشغيل المحرك (Start/Stop)" },
      anahtarsiz: { tr: "Anahtarsız giriş ve çalıştırma", en: "Keyless entry and start", ar: "دخول وتشغيل بدون مفتاح" },
      "dijital-gosterge": { tr: "Dijital gösterge paneli", en: "Digital instrument cluster", ar: "لوحة عدادات رقمية" },
      "deri-direksiyon": { tr: "Deri direksiyon", en: "Leather steering wheel", ar: "مقود جلدي" },
      "direksiyon-kumanda": { tr: "Direksiyondan kumanda", en: "Steering wheel controls", ar: "أزرار تحكم على المقود" },
      "elektrikli-cam": { tr: "Elektrikli camlar", en: "Power windows", ar: "نوافذ كهربائية" },
      "yagmur-sensoru": { tr: "Yağmur sensörü", en: "Rain sensor", ar: "حساس المطر" },
      "far-sensoru": { tr: "Far sensörü", en: "Automatic headlights", ar: "حساس الإضاءة التلقائية" },
      "elektrikli-bagaj": { tr: "Elektrikli bagaj kapağı", en: "Power tailgate", ar: "باب صندوق كهربائي" },
      ambiyans: { tr: "Ambiyans aydınlatma", en: "Ambient lighting", ar: "إضاءة داخلية محيطية" },
    },
  },
  dis: {
    tr: "Dış Donanım",
    en: "Exterior",
    ar: "التجهيزات الخارجية",
    items: {
      sunroof: { tr: "Sunroof", en: "Sunroof", ar: "فتحة سقف" },
      panoramik: { tr: "Panoramik cam tavan", en: "Panoramic glass roof", ar: "سقف زجاجي بانورامي" },
      "alasim-jant": { tr: "Alaşım jant", en: "Alloy wheels", ar: "جنوط سبائك" },
      "led-far": { tr: "LED farlar", en: "LED headlights", ar: "مصابيح أمامية LED" },
      xenon: { tr: "Xenon farlar", en: "Xenon headlights", ar: "مصابيح أمامية زينون" },
      "gunduz-led": { tr: "Gündüz LED farları", en: "LED daytime running lights", ar: "أضواء نهارية LED" },
      "sis-fari": { tr: "Sis farları", en: "Fog lights", ar: "مصابيح ضباب" },
      "otomatik-uzun-far": { tr: "Otomatik uzun far", en: "Automatic high beam", ar: "ضبط تلقائي للأضواء العالية" },
      "far-yikama": { tr: "Far yıkama sistemi", en: "Headlight washers", ar: "نظام غسل المصابيح" },
      "ayna-katlanir": { tr: "Elektrikli katlanır aynalar", en: "Power-folding mirrors", ar: "مرايا جانبية قابلة للطي كهربائياً" },
      "ayna-isitmali": { tr: "Isıtmalı aynalar", en: "Heated mirrors", ar: "مرايا جانبية مُدفأة" },
      "tavan-rayi": { tr: "Tavan rayı", en: "Roof rails", ar: "قضبان سقف" },
      "ceki-demiri": { tr: "Çeki demiri", en: "Tow bar", ar: "خطاف قطر" },
      "karartilmis-cam": { tr: "Karartılmış arka camlar", en: "Tinted rear windows", ar: "نوافذ خلفية معتمة" },
      spoiler: { tr: "Spoiler", en: "Spoiler", ar: "جناح خلفي (سبويلر)" },
    },
  },
  multimedya: {
    tr: "Multimedya",
    en: "Multimedia",
    ar: "الوسائط المتعددة",
    items: {
      bluetooth: { tr: "Bluetooth", en: "Bluetooth", ar: "بلوتوث" },
      usb: { tr: "USB / AUX girişi", en: "USB / AUX input", ar: "منفذ USB / AUX" },
      navigasyon: { tr: "Navigasyon", en: "Navigation", ar: "نظام ملاحة" },
      carplay: { tr: "Apple CarPlay", en: "Apple CarPlay", ar: "Apple CarPlay" },
      "android-auto": { tr: "Android Auto", en: "Android Auto", ar: "Android Auto" },
      dokunmatik: { tr: "Dokunmatik ekran", en: "Touchscreen", ar: "شاشة لمس" },
      "ses-sistemi": { tr: "Premium ses sistemi", en: "Premium sound system", ar: "نظام صوتي متميز" },
      "kablosuz-sarj": { tr: "Kablosuz şarj", en: "Wireless charging", ar: "شحن لاسلكي" },
      radyo: { tr: "Radyo", en: "Radio", ar: "راديو" },
      "arka-eglence": { tr: "Arka koltuk eğlence sistemi", en: "Rear-seat entertainment", ar: "نظام ترفيه للمقاعد الخلفية" },
    },
  },
} satisfies Record<string, Label & { items: Record<string, Label> }>;

type FeatureGroup = keyof typeof FEATURE_GROUPS;
export const FEATURE_GROUP_KEYS = Object.keys(FEATURE_GROUPS) as FeatureGroup[];

/** Tüm özellikler tek listede: anahtar → { grup, etiketler }. */
const FEATURES: Record<string, Label & { group: FeatureGroup }> = Object.fromEntries(
  FEATURE_GROUP_KEYS.flatMap((g) =>
    Object.entries(FEATURE_GROUPS[g].items).map(([key, label]) => [key, { ...label, group: g }]),
  ),
);
export const FEATURE_KEYS = Object.keys(FEATURES);
