import type { Metadata } from "next";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Ekin Otomotiv kişisel verilerin korunması ve işlenmesine ilişkin aydınlatma metni.",
};

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
          <div className="panel">
            <p>
              {CONTACT.legalName} (“Şirketimiz”) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
              kapsamında veri sorumlusu sıfatıyla, internet sitemiz üzerinden ilettiğiniz kişisel verilerinizi aşağıda
              açıklanan çerçevede işlemekteyiz.
            </p>

            <h2>1. Veri sorumlusu</h2>
            <p>
              {CONTACT.legalName}
              <br />
              Adres: {CONTACT.address}
              <br />
              {CONTACT.email && (
                <>
                  E-posta: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> ·{" "}
                </>
              )}
              Telefon: <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
            </p>

            <h2>2. İşlenen kişisel veriler</h2>
            <ul>
              <li><strong>Kimlik bilgisi:</strong> ad ve soyad</li>
              <li><strong>İletişim bilgisi:</strong> telefon numarası, e-posta adresi (isteğe bağlı)</li>
              <li>
                <strong>Talep bilgisi:</strong> talep türü (satın alma, takas, araç satışı, bilgi), ilgilendiğiniz araç
                ve mesajınızda paylaştığınız bilgiler (ör. aracınızın marka, model ve hasar bilgisi)
              </li>
              <li><strong>İşlem bilgisi:</strong> talebin oluşturulduğu tarih ve saat</li>
            </ul>
            <p>
              Mesaj alanına kimlik numarası, sağlık bilgisi gibi özel nitelikli veya talebinizle ilgisi olmayan kişisel
              veriler yazmamanızı rica ederiz.
            </p>

            <h2>3. İşleme amaçları</h2>
            <ul>
              <li>Araç satın alma, takas, araç satışı ve bilgi taleplerinizin alınması ve size dönüş yapılması,</li>
              <li>Teklif hazırlanması ve sözleşme öncesi görüşmelerin yürütülmesi,</li>
              <li>Taleplerin takibi ve müşteri ilişkilerinin yönetilmesi,</li>
              <li>Hukuki yükümlülüklerin yerine getirilmesi ve olası uyuşmazlıklarda hakların korunması.</li>
            </ul>

            <h2>4. Toplama yöntemi ve hukuki sebepler</h2>
            <p>
              Kişisel verileriniz, internet sitemizdeki talep formlarını doldurmanız yoluyla elektronik ortamda
              toplanır ve KVKK’nın 5. maddesinin 2. fıkrasında yer alan;
            </p>
            <ul>
              <li>(c) bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması,</li>
              <li>(ç) veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi,</li>
              <li>(e) bir hakkın tesisi, kullanılması veya korunması,</li>
              <li>(f) temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaatlerimiz</li>
            </ul>
            <p>hukuki sebeplerine dayanılarak işlenir.</p>

            <h2>5. Aktarım</h2>
            <p>
              Kişisel verileriniz pazarlama amacıyla üçüncü kişilerle paylaşılmaz. Talepleriniz, hizmet aldığımız bulut
              tabanlı tablo (Google Sheets) ve internet sitesi barındırma hizmeti sağlayıcılarının sunucularında
              saklanır. Bu sağlayıcıların sunucuları yurt dışında bulunabileceğinden, verileriniz KVKK’nın 9. maddesinde
              öngörülen usul ve güvencelere uygun olarak yurt dışına aktarılabilir. Ayrıca, kanunen yetkili kamu kurum
              ve kuruluşlarının talebi hâlinde ilgili mevzuat çerçevesinde paylaşım yapılabilir.
            </p>

            <h2>6. Saklama süresi</h2>
            <p>
              Kişisel verileriniz, işleme amacının gerektirdiği ve ilgili mevzuatta öngörülen süreler boyunca saklanır;
              bu sürelerin sonunda silinir, yok edilir veya anonim hâle getirilir.
            </p>

            <h2>7. Çerezler</h2>
            <p>
              Sitemiz ziyaretçileri takip etmek veya reklam amacıyla çerez kullanmaz. Yalnızca yönetim paneline giriş
              yapan yetkili kullanıcılar için oturumun sürdürülmesine yönelik zorunlu bir çerez kullanılır.
            </p>

            <h2>8. Haklarınız</h2>
            <p>KVKK’nın 11. maddesi uyarınca veri sorumlusuna başvurarak;</p>
            <ul>
              <li>kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,</li>
              <li>işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
              <li>eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme,</li>
              <li>KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme,</li>
              <li>düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
              <li>
                münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz
                etme,
              </li>
              <li>kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
            <p>haklarına sahipsiniz.</p>

            <h2>9. Başvuru</h2>
            <p>
              Taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun olarak yukarıdaki adrese
              yazılı olarak
              {CONTACT.email && (
                <>
                  {" "}veya <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> adresine
                </>
              )}{" "}
              iletebilirsiniz.
              Başvurunuz, niteliğine göre en geç otuz gün içinde ücretsiz olarak sonuçlandırılır.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
