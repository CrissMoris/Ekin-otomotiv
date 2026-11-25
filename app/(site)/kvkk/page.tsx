import type { Metadata } from "next";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Ekin Otomotiv kişisel verilerin korunması ve işlenmesine ilişkin aydınlatma metni.",
};

const LAST_UPDATED = "25 Kasım 2026";

export default function PrivacyPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>KVKK Aydınlatma Metni</h1>
          <p>Kişisel verilerinizin işlenmesine ilişkin bilgilendirme</p>
        </div>
      </section>
      <div className="page">
        <div className="container legal">
          <article className="panel legal-doc">
            <header className="legal-head">
              <span className="eyebrow">6698 sayılı Kanun</span>
              <h2 className="legal-title">Kişisel Verilerin Korunması ve İşlenmesine İlişkin Aydınlatma Metni</h2>
              <p className="legal-meta">Son güncelleme: {LAST_UPDATED}</p>
            </header>

            <section className="legal-section">
              <h3><span className="legal-no">1.</span> Amaç ve kapsam</h3>
              <p>
                Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca veri sorumlusu
                sıfatıyla hareket eden {CONTACT.legalName} (“İşletmemiz”) tarafından, internet sitemiz aracılığıyla
                bizimle paylaştığınız kişisel verilerin hangi amaçlarla ve nasıl işlendiği konusunda sizi bilgilendirmek
                amacıyla hazırlanmıştır.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">2.</span> İşlenen kişisel veriler</h3>
              <ul>
                <li><strong>Kimlik bilgisi:</strong> ad ve soyad</li>
                <li><strong>İletişim bilgisi:</strong> telefon numarası, e-posta adresi (isteğe bağlı)</li>
                <li>
                  <strong>Talep bilgisi:</strong> talep türü (satın alma, takas, araç satışı, bilgi), ilgilendiğiniz araç
                  ve mesajınızda paylaştığınız bilgiler (ör. aracınızın marka, model ve hasar bilgisi)
                </li>
                <li><strong>İşlem bilgisi:</strong> talebin oluşturulduğu tarih ve saat</li>
              </ul>
              <p className="legal-note">
                Mesaj alanına kimlik numarası, sağlık bilgisi gibi özel nitelikli veya talebinizle ilgisi olmayan kişisel
                veriler yazmamanızı rica ederiz.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">3.</span> Kişisel verilerin işlenme amaçları</h3>
              <ul>
                <li>Araç satın alma, takas, araç satışı ve bilgi taleplerinizin alınması ve size dönüş yapılması,</li>
                <li>Teklif hazırlanması ve sözleşme öncesi görüşmelerin yürütülmesi,</li>
                <li>Taleplerin takibi ve müşteri ilişkilerinin yönetilmesi,</li>
                <li>Hukuki yükümlülüklerin yerine getirilmesi ve olası uyuşmazlıklarda hakların korunması.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">4.</span> Toplama yöntemi ve hukuki sebepler</h3>
              <p>
                Kişisel verileriniz, internet sitemizdeki talep formlarını doldurmanız yoluyla elektronik ortamda
                toplanır ve KVKK’nın 5. maddesinin 2. fıkrasında yer alan aşağıdaki hukuki sebeplere dayanılarak işlenir:
              </p>
              <ul>
                <li>(c) bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması,</li>
                <li>(ç) veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi,</li>
                <li>(e) bir hakkın tesisi, kullanılması veya korunması,</li>
                <li>(f) temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimiz.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">5.</span> Kişisel verilerin aktarılması</h3>
              <p>
                Kişisel verileriniz pazarlama amacıyla üçüncü kişilerle paylaşılmaz. Talepleriniz, hizmet aldığımız bulut
                tabanlı tablo (Google Sheets) ve internet sitesi barındırma hizmeti sağlayıcılarının sunucularında
                saklanır. Bu sağlayıcıların sunucuları yurt dışında bulunabileceğinden, verileriniz KVKK’nın 9.
                maddesinde öngörülen usul ve güvencelere uygun olarak yurt dışına aktarılabilir. Ayrıca, kanunen yetkili
                kamu kurum ve kuruluşlarının talebi hâlinde ilgili mevzuat çerçevesinde paylaşım yapılabilir.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">6.</span> Saklama süresi</h3>
              <p>
                Kişisel verileriniz, işleme amacının gerektirdiği ve ilgili mevzuatta öngörülen süreler boyunca saklanır;
                bu sürelerin sonunda silinir, yok edilir veya anonim hâle getirilir.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">7.</span> Çerezler</h3>
              <p>
                Sitemiz ziyaretçileri takip etmek veya reklam amacıyla çerez kullanmaz. Yalnızca yönetim paneline giriş
                yapan yetkili kullanıcılar için oturumun sürdürülmesine yönelik zorunlu bir çerez kullanılır.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">8.</span> KVKK kapsamındaki haklarınız</h3>
              <p>KVKK’nın 11. maddesi uyarınca veri sorumlusuna başvurarak aşağıdaki haklarınızı kullanabilirsiniz:</p>
              <ul>
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
                <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,</li>
                <li>KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
                <li>Düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
                <li>
                  Münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz
                  etme,
                </li>
                <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">9.</span> Başvuru yöntemi</h3>
              <p>
                Yukarıda sayılan haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında
                Tebliğ’e uygun olarak, kimliğinizi tespit etmeye yarayan bilgilerle birlikte İşletmemizin{" "}
                {CONTACT.address} adresine yazılı olarak
                {CONTACT.email && (
                  <>
                    {" "}veya <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> e-posta adresine
                  </>
                )}{" "}
                iletebilirsiniz. Başvurunuz, niteliğine göre en geç otuz gün içinde ücretsiz olarak sonuçlandırılır.
              </p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
