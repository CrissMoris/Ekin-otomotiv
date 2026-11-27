import { CONTACT } from "@/lib/constants";
import type { Lang } from "@/lib/i18n";

const LAST_UPDATED = "25 Kasım 2026";

function KvkkTr() {
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
                tabanlı veritabanı (MongoDB Atlas) ve internet sitesi barındırma hizmeti sağlayıcılarının sunucularında
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

function KvkkAr() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>إشعار حماية البيانات الشخصية</h1>
          <p>معلومات حول معالجة بياناتك الشخصية</p>
        </div>
      </section>
      <div className="page">
        <div className="container legal">
          <article className="panel legal-doc">
            <header className="legal-head">
              <span className="eyebrow">القانون رقم 6698</span>
              <h2 className="legal-title">إشعار بشأن حماية البيانات الشخصية ومعالجتها</h2>
              <p className="legal-meta">آخر تحديث: 25 نوفمبر 2026</p>
            </header>

            <p className="legal-note" style={{ marginTop: 18 }}>
              هذا النص ترجمة لأغراض إعلامية فقط. في حال وجود أي اختلاف، يُعتمد النص التركي.
            </p>

            <section className="legal-section">
              <h3><span className="legal-no">1.</span> الغرض والنطاق</h3>
              <p>
                أُعدّ هذا الإشعار من قِبل {CONTACT.legalName} (“منشأتنا”) بصفتها مسؤولة عن البيانات وفقاً لقانون حماية
                البيانات الشخصية التركي رقم 6698 (“KVKK”)، بهدف إعلامك بالأغراض التي تُعالَج من أجلها البيانات الشخصية
                التي تشاركها معنا عبر موقعنا الإلكتروني وبكيفية معالجتها.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">2.</span> البيانات الشخصية التي تتم معالجتها</h3>
              <ul>
                <li><strong>بيانات الهوية:</strong> الاسم والكنية</li>
                <li><strong>بيانات الاتصال:</strong> رقم الهاتف، والبريد الإلكتروني (اختياري)</li>
                <li>
                  <strong>بيانات الطلب:</strong> نوع الطلب (شراء، مقايضة، بيع سيارة، طلب معلومات)، والسيارة التي تهتم
                  بها، والمعلومات التي تذكرها في رسالتك (مثل ماركة سيارتك وطرازها ومعلومات الأضرار)
                </li>
                <li><strong>بيانات المعاملة:</strong> تاريخ إنشاء الطلب ووقته</li>
              </ul>
              <p className="legal-note">
                نرجو عدم كتابة بيانات شخصية ذات طبيعة خاصة أو غير متعلقة بطلبك، مثل رقم الهوية أو المعلومات الصحية، في
                حقل الرسالة.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">3.</span> أغراض معالجة البيانات الشخصية</h3>
              <ul>
                <li>استلام طلبات الشراء والمقايضة وبيع السيارات وطلبات المعلومات، والرد عليك،</li>
                <li>إعداد العروض وإجراء المفاوضات السابقة للتعاقد،</li>
                <li>متابعة الطلبات وإدارة العلاقة مع العملاء،</li>
                <li>الوفاء بالالتزامات القانونية وحماية الحقوق في حال نشوء أي نزاع.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">4.</span> طريقة الجمع والأسس القانونية</h3>
              <p>
                تُجمع بياناتك الشخصية إلكترونياً عند تعبئتك لنماذج الطلب على موقعنا، وتُعالَج استناداً إلى الأسس
                القانونية التالية الواردة في الفقرة الثانية من المادة الخامسة من القانون:
              </p>
              <ul>
                <li>(c) ارتباط المعالجة مباشرةً بإبرام عقد أو تنفيذه،</li>
                <li>(ç) ضرورة المعالجة لوفاء المسؤول عن البيانات بالتزاماته القانونية،</li>
                <li>(e) ضرورة المعالجة لإنشاء حق أو ممارسته أو حمايته،</li>
                <li>(f) مصالحنا المشروعة، شريطة عدم الإضرار بحقوقك وحرياتك الأساسية.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">5.</span> نقل البيانات الشخصية</h3>
              <p>
                لا تتم مشاركة بياناتك الشخصية مع أطراف ثالثة لأغراض تسويقية. تُحفظ طلباتك على خوادم مزوّدي الخدمة الذين
                نستعين بهم، وهم مزوّد قاعدة البيانات السحابية (MongoDB Atlas) ومزوّد استضافة الموقع. ونظراً لاحتمال وجود خوادم
                هؤلاء المزوّدين خارج تركيا، فقد تُنقل بياناتك إلى الخارج وفقاً للإجراءات والضمانات المنصوص عليها في
                المادة التاسعة من القانون. كما يمكن مشاركتها مع الجهات والمؤسسات العامة المخوّلة قانوناً عند طلبها، في
                إطار التشريعات ذات الصلة.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">6.</span> مدة الاحتفاظ</h3>
              <p>
                يُحتفظ ببياناتك الشخصية طوال المدة التي يقتضيها غرض المعالجة والمدد المنصوص عليها في التشريعات ذات
                الصلة، وتُحذف أو تُتلف أو تُجعل مجهولة الهوية عند انتهاء هذه المدد.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">7.</span> ملفات تعريف الارتباط (الكوكيز)</h3>
              <p>
                لا يستخدم موقعنا ملفات تعريف الارتباط لتتبّع الزوار أو لأغراض إعلانية. ويُستخدم فقط ملف ضروري واحد
                للحفاظ على جلسة المستخدمين المخوّلين الذين يسجّلون الدخول إلى لوحة الإدارة.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">8.</span> حقوقك بموجب القانون</h3>
              <p>وفقاً للمادة الحادية عشرة من القانون، يحق لك التقدم إلى المسؤول عن البيانات من أجل:</p>
              <ul>
                <li>معرفة ما إذا كانت بياناتك الشخصية تُعالَج، وطلب معلومات عن ذلك إن كانت تُعالَج،</li>
                <li>معرفة الغرض من المعالجة وما إذا كانت البيانات تُستخدم وفقاً لهذا الغرض،</li>
                <li>معرفة الأطراف الثالثة التي نُقلت إليها البيانات داخل البلاد أو خارجها،</li>
                <li>طلب تصحيح البيانات في حال معالجتها بشكل ناقص أو غير صحيح،</li>
                <li>طلب حذف البيانات أو إتلافها وفق الشروط الواردة في المادة السابعة من القانون،</li>
                <li>طلب إبلاغ الأطراف الثالثة التي نُقلت إليها البيانات بعمليات التصحيح أو الحذف أو الإتلاف،</li>
                <li>الاعتراض على أي نتيجة ضارة بك تنشأ عن تحليل البيانات حصرياً بواسطة أنظمة آلية،</li>
                <li>المطالبة بالتعويض عن الضرر في حال تضررك بسبب معالجة البيانات بشكل مخالف للقانون.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">9.</span> طريقة تقديم الطلب</h3>
              <p>
                يمكنك تقديم طلباتك المتعلقة بالحقوق المذكورة أعلاه كتابياً، وفقاً للائحة إجراءات ومبادئ التقدم إلى
                المسؤول عن البيانات، مع المعلومات التي تثبت هويتك، على عنوان منشأتنا: <span dir="ltr">{CONTACT.address}</span>
                {CONTACT.email && (
                  <>
                    {" "}أو عبر البريد الإلكتروني <a href={`mailto:${CONTACT.email}`} dir="ltr">{CONTACT.email}</a>
                  </>
                )}
                . ويُبتّ في طلبك مجاناً خلال ثلاثين يوماً كحد أقصى بحسب طبيعته.
              </p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}


function KvkkEn() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Privacy Notice</h1>
          <p>Information on the processing of your personal data</p>
        </div>
      </section>
      <div className="page">
        <div className="container legal">
          <article className="panel legal-doc">
            <header className="legal-head">
              <span className="eyebrow">Law No. 6698</span>
              <h2 className="legal-title">Notice on the Protection and Processing of Personal Data</h2>
              <p className="legal-meta">Last updated: 25 November 2026</p>
            </header>

            <p className="legal-note" style={{ marginTop: 18 }}>
              This text is a translation provided for information purposes only. In case of any discrepancy, the Turkish
              version prevails.
            </p>

            <section className="legal-section">
              <h3><span className="legal-no">1.</span> Purpose and scope</h3>
              <p>
                This notice has been prepared by {CONTACT.legalName} (the “Business”), acting as data controller under the
                Turkish Personal Data Protection Law No. 6698 (“KVKK”), to inform you about the purposes for which and the
                manner in which the personal data you share with us through our website are processed.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">2.</span> Personal data processed</h3>
              <ul>
                <li><strong>Identity data:</strong> first and last name</li>
                <li><strong>Contact data:</strong> phone number, email address (optional)</li>
                <li>
                  <strong>Request data:</strong> request type (purchase, trade-in, selling your car, information), the
                  vehicle you are interested in and the details you share in your message (e.g. your car’s make, model
                  and damage information)
                </li>
                <li><strong>Transaction data:</strong> the date and time the request was created</li>
              </ul>
              <p className="legal-note">
                Please do not include special categories of personal data, such as your ID number or health information,
                or any personal data unrelated to your request in the message field.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">3.</span> Purposes of processing</h3>
              <ul>
                <li>Receiving your purchase, trade-in, car sale and information requests and responding to you,</li>
                <li>Preparing offers and conducting pre-contractual negotiations,</li>
                <li>Following up requests and managing customer relations,</li>
                <li>Fulfilling legal obligations and protecting rights in the event of a dispute.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">4.</span> Method of collection and legal grounds</h3>
              <p>
                Your personal data are collected electronically when you fill in the request forms on our website and are
                processed on the following legal grounds set out in Article 5(2) of the KVKK:
              </p>
              <ul>
                <li>(c) processing is directly related to the conclusion or performance of a contract,</li>
                <li>(ç) processing is necessary for the data controller to fulfil its legal obligations,</li>
                <li>(e) processing is necessary for the establishment, exercise or protection of a right,</li>
                <li>(f) our legitimate interests, provided that your fundamental rights and freedoms are not harmed.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">5.</span> Transfer of personal data</h3>
              <p>
                Your personal data are not shared with third parties for marketing purposes. Your requests are stored on
                the servers of the service providers we use: a cloud-based database provider (MongoDB Atlas) and our
                website hosting provider. As these providers’ servers may be located outside Türkiye, your data may be
                transferred abroad in accordance with the procedures and safeguards set out in Article 9 of the KVKK. Data
                may also be shared with legally authorised public authorities upon request, within the framework of the
                relevant legislation.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">6.</span> Retention period</h3>
              <p>
                Your personal data are retained for as long as required by the purpose of processing and the periods set
                out in the relevant legislation, and are deleted, destroyed or anonymised at the end of these periods.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">7.</span> Cookies</h3>
              <p>
                Our website does not use cookies to track visitors or for advertising. Only one strictly necessary cookie
                is used to maintain the session of authorised users who sign in to the admin panel.
              </p>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">8.</span> Your rights under the KVKK</h3>
              <p>Under Article 11 of the KVKK, you may apply to the data controller to:</p>
              <ul>
                <li>Learn whether your personal data are processed and request information if they are,</li>
                <li>Learn the purpose of processing and whether the data are used in line with that purpose,</li>
                <li>Know the third parties in Türkiye or abroad to whom the data are transferred,</li>
                <li>Request correction of incomplete or inaccurate data,</li>
                <li>Request deletion or destruction of the data under the conditions set out in Article 7 of the KVKK,</li>
                <li>Request that correction, deletion or destruction be notified to third parties to whom the data were transferred,</li>
                <li>Object to any result to your detriment arising from analysis exclusively by automated systems,</li>
                <li>Claim compensation for damage suffered due to unlawful processing.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h3><span className="legal-no">9.</span> How to apply</h3>
              <p>
                You may submit your requests regarding the above rights in writing, in accordance with the Communiqué on
                the Procedures and Principles of Application to the Data Controller, together with information
                identifying you, to the Business’s address at {CONTACT.address}
                {CONTACT.email && (
                  <>
                    {" "}or by email to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </>
                )}
                . Your application will be concluded free of charge within thirty days at the latest, depending on its
                nature.
              </p>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}

export function KvkkPage({ lang }: { lang: Lang }) {
  if (lang === "ar") return <KvkkAr />;
  if (lang === "en") return <KvkkEn />;
  return <KvkkTr />;
}
