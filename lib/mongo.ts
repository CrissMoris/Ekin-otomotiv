import "server-only";
import { MongoClient, type Collection, type Document } from "mongodb";
import { mongoConfig } from "./config";
import { DataSourceError } from "./data-error";

/**
 * MongoDB bağlantısı. Sunucusuz ortamda (Vercel) her istekte yeni bağlantı açılmaması için
 * istemci süreç boyunca tek kez oluşturulup yeniden kullanılır.
 */

type Cache = { uri: string; client: Promise<MongoClient>; indexes?: Promise<void> };
const holder = globalThis as typeof globalThis & { __ekinMongo?: Cache };

/** Bağlantı hatalarını, yöneticiye gösterilebilecek Türkçe mesajlara çevirir (gizli değerler yazılmaz). */
function toDataError(error: unknown): unknown {
  if (error instanceof DataSourceError) return error;
  const e = (error ?? {}) as { name?: string; code?: unknown; message?: string };
  const name = String(e.name ?? "");
  const msg = String(e.message ?? "");
  if (name === "MongoParseError" || (name === "MongoAPIError" && /uri|scheme|srv/i.test(msg))) {
    return new DataSourceError("MONGODB_URI biçimi hatalı. Atlas'ta Connect → Drivers bölümündeki adresi eksiksiz kopyalayın.");
  }
  if (e.code === 18 || e.code === 8000 || /bad auth|authentication failed/i.test(msg)) {
    return new DataSourceError("MongoDB kullanıcı adı veya şifresi hatalı. MONGODB_URI içindeki kullanıcı adını ve şifreyi kontrol edin.");
  }
  if (e.code === 13 || /not authorized/i.test(msg)) {
    return new DataSourceError("MongoDB kullanıcısının bu veritabanına yetkisi yok. Atlas'ta kullanıcının yetkisini ve MONGODB_DB adını kontrol edin.");
  }
  if (/querySrv|ENOTFOUND|ENODATA|EREFUSED/i.test(msg)) {
    return new DataSourceError("MongoDB küme adresi bulunamadı. MONGODB_URI içindeki “cluster0.….mongodb.net” kısmını kontrol edin.");
  }
  if (/^Mongo(ServerSelection|Network|NetworkTimeout|TopologyClosed)Error$/.test(name)) {
    return new DataSourceError(
      "MongoDB'ye ulaşılamadı. Atlas'ta Network Access listesinde 0.0.0.0/0 olduğundan ve kümenin çalıştığından (duraklatılmadığından) emin olun.",
    );
  }
  return error;
}

function fail(error: unknown): never {
  const mapped = toDataError(error);
  if (mapped !== error) console.error("MongoDB hatası:", error);
  throw mapped;
}

function clientFor(uri: string): Cache {
  const cached = holder.__ekinMongo;
  if (cached && cached.uri === uri) return cached;
  let client: MongoClient;
  try {
    client = new MongoClient(uri, {
      appName: "ekin-otomotiv",
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    });
  } catch (error) {
    fail(error);
  }
  const entry: Cache = { uri, client: client.connect() };
  // Bağlantı kurulamazsa bir sonraki istek yeniden dener.
  entry.client.catch(() => {
    if (holder.__ekinMongo === entry) holder.__ekinMongo = undefined;
  });
  holder.__ekinMongo = entry;
  return entry;
}

interface Collections<V extends Document, I extends Document> {
  vehicles: Collection<V>;
  inquiries: Collection<I>;
}

/** Koleksiyonlara erişir; ilk bağlantıda gerekli indeksleri oluşturur. */
async function mongoCollections<V extends Document, I extends Document>(): Promise<Collections<V, I>> {
  const cfg = mongoConfig();
  if (!cfg) throw new DataSourceError("MONGODB_URI tanımlı değil.");
  if (/<db_password>|<password>/i.test(cfg.uri)) {
    throw new DataSourceError("MONGODB_URI içindeki <db_password> kısmını, veritabanı kullanıcısının şifresiyle değiştirin.");
  }
  if (!/^mongodb(\+srv)?:\/\//.test(cfg.uri)) {
    throw new DataSourceError("MONGODB_URI “mongodb+srv://” ile başlamalı. Atlas'ta Connect → Drivers bölümündeki adresi kopyalayın.");
  }
  const entry = clientFor(cfg.uri);
  try {
    const db = (await entry.client).db(cfg.dbName);
    const vehicles = db.collection<V>("vehicles");
    const inquiries = db.collection<I>("inquiries");
    entry.indexes ??= Promise.all([
      // Aynı form iki kez gönderilirse ikinci kayıt oluşmaz.
      inquiries.createIndex(
        { submissionKey: 1 },
        { name: "submissionKey_unique", unique: true, partialFilterExpression: { submissionKey: { $gt: "" } } },
      ),
      inquiries.createIndex({ createdAt: -1 }, { name: "createdAt_desc" }),
    ]).then(() => undefined);
    entry.indexes.catch(() => {
      entry.indexes = undefined;
    });
    await entry.indexes;
    return { vehicles, inquiries };
  } catch (error) {
    fail(error);
  }
}

/** Bir MongoDB işlemini çalıştırır; bağlantı hatalarını Türkçe mesaja çevirir. */
export async function withMongo<V extends Document, I extends Document, T>(fn: (c: Collections<V, I>) => Promise<T>): Promise<T> {
  const c = await mongoCollections<V, I>();
  try {
    return await fn(c);
  } catch (error) {
    fail(error);
  }
}

export const isDuplicateKey = (error: unknown) => (error as { code?: unknown } | null)?.code === 11000;
