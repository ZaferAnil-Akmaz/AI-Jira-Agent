import type { GenerateRequest } from "@/lib/validation/schemas";
import type { WorkBreakdown, WorkTask } from "@/types/domain";

export function isMessagingRequirement(input: GenerateRequest): boolean {
  return /mesajlaş|mesaj|message|messaging|chat|conversation|inbox/i.test(
    `${input.requirement} ${input.context}`,
  );
}

export function buildMockMessagingPlan(input: GenerateRequest): WorkBreakdown {
  const isTr = input.language === "tr";
  const includeDesign = /tasarım|\bdesign\b/i.test(`${input.requirement} ${input.context}`);
  const allTasks: WorkTask[] = [
    {
      id: "design-messaging-experience",
      type: "design",
      title: isTr
        ? "Mesajlaşma Bilgi Mimarisi ve Etkileşim Akışlarını Tasarla"
        : "Design Messaging Information Architecture and Interaction Flows",
      description: isTr
        ? `Amaç
Kullanıcının konuşmalarını bulabildiği, yeni bir konuşma başlatabildiği ve mesaj alışverişini kesintisiz sürdürebildiği anlaşılır bir deneyim tanımla.

Kapsam
- Konuşma listesi, konuşma detayı ve mesaj oluşturma alanının bilgi mimarisi
- Yeni konuşma, boş gelen kutusu, okunmamış mesaj, gönderiliyor, gönderilemedi ve yeniden deneme durumları
- Uzun içerik, yoğun konuşma geçmişi, responsive yerleşim, klavye kullanımı ve accessibility davranışları

Uygulama Notları
Akışlar mevcut design system bileşenleriyle eşleştirilmeli; gerçek zamanlı güncelleme veya teslim bilgisi gibi doğrulanmamış davranışlar açık karar noktaları olarak işaretlenmelidir.`
        : `Objective
Define a clear experience in which users can find conversations, start a new conversation, and continue exchanging messages without losing context.

Scope
- Information architecture for the conversation list, thread view, and message composer
- New conversation, empty inbox, unread, sending, failed, and retry states
- Long content, dense history, responsive layout, keyboard use, and accessibility behavior

Implementation Notes
Map flows to the existing design system and preserve unconfirmed behavior such as real-time updates or delivery indicators as explicit decisions.`,
      acceptanceCriteria: isTr
        ? [
            "Konuşma listesi, konuşma detayı ve yeni konuşma akışları tasarımda tanımlanmıştır.",
            "Loading, empty, unread, gönderiliyor, hata ve yeniden deneme durumları gösterilmiştir.",
            "Klavye navigasyonu, focus sırası ve erişilebilir isimlendirme beklentileri belirtilmiştir.",
            "Mobil ve masaüstü responsive davranışları geliştiriciye aktarılabilir seviyededir.",
          ]
        : [
            "Conversation list, thread, and new-conversation flows are defined.",
            "Loading, empty, unread, sending, failure, and retry states are represented.",
            "Keyboard navigation, focus order, and accessible naming expectations are specified.",
            "Mobile and desktop responsive behavior is implementation-ready.",
          ],
      priority: "high",
      rationale: isTr
        ? "Mesajlaşma; çoklu ekran durumu, zaman sıralaması ve hata geri bildirimi içeren etkileşim yoğun bir akıştır. Bu davranışların geliştirme öncesinde tutarlı biçimde tanımlanması yeniden çalışma riskini azaltır."
        : "Messaging is interaction-heavy and includes temporal ordering, multiple states, and failure feedback. Defining these behaviors before implementation reduces rework.",
      dependsOn: [],
    },
    {
      id: "backend-messaging-capability",
      type: "backend",
      title: isTr
        ? "Konuşma ve Mesajlaşma Backend Capability’sini Oluştur"
        : "Implement Conversation and Messaging Backend Capabilities",
      description: isTr
        ? `Amaç
Yetkili kullanıcıların bire bir sohbet başlatmasını, geçmişi görüntülemesini ve mesajları gerçek zamanlı olarak güvenli biçimde gönderip almasını sağlayan backend capability'sini geliştir.

Kapsam
- Conversations, Messages ve Participants tablolarını/modellerini oluştur; ilişkileri, indeksleri, oluşturulma zamanını ve kararlı mesaj sıralamasını tanımla.
- Konuşma başlatma ve listeleme, sayfalı mesaj geçmişi getirme, mesaj gönderme, düzenleme ve silme REST/GraphQL API uç noktalarını geliştir.
- WebSocket tabanlı gerçek zamanlı iletişimi kur; bağlantı yaşam döngüsünü, tekrar bağlanmayı, yinelenen event'leri ve çevrimdışı istemcinin yeniden senkronizasyonunu ele al.
- Mesajın gönderildi ve okundu durumlarını katılımcı bazında sakla; read receipt güncellemesini yetkili ve idempotent hale getir.
- Kullanıcıların yalnızca dahil oldukları konuşmaları okuyabilmesi ve yalnızca kendi adına mesaj gönderebilmesi için authentication/authorization, input validation ve güvenli hata yanıtları ekle.

Edge Cases
Yetkisiz erişim, engellenen veya silinmiş kullanıcı, boş/geçersiz mesaj, yinelenen gönderim, eşzamanlı mesajlar, ağ kesintisi sonrası tekrar bağlanma ve pagination sınırları ele alınmalıdır.`
        : `Objective
Provide secure and consistent backend capabilities for authorized participants to create conversations, retrieve history, and send messages.

Scope
- Conversation, participant, and message domain models and persistence requirements
- API contracts for creating/listing conversations, paginating history, and sending messages
- Membership authorization, input validation, ordering, idempotency, and safe error responses
- Evaluation of real-time delivery, polling, or refresh strategy against existing infrastructure

Edge Cases
Handle unauthorized access, unknown recipients, invalid messages, duplicate sends, concurrent messages, deleted users, and pagination boundaries.`,
      acceptanceCriteria: isTr
        ? [
            "Conversations, Messages ve Participants modelleri gerekli ilişkiler ve sorgu indeksleriyle migration üzerinden oluşturulur.",
            "Yetkili kullanıcı konuşma başlatabilir, konuşmalarını listeleyebilir ve mesaj geçmişini cursor tabanlı pagination ile kayıp veya tekrar olmadan alabilir.",
            "Mesaj gönderme, düzenleme ve silme uç noktaları sahiplik kurallarını uygular; geçersiz istekleri tutarlı hata sözleşmesiyle reddeder.",
            "Yeni mesajlar WebSocket üzerinden doğru konuşmanın bağlı katılımcılarına bir kez iletilir ve yeniden bağlantı sonrasında eksik mesajlar senkronize edilir.",
            "Okundu bilgisi yalnızca konuşma katılımcısı tarafından güncellenebilir ve diğer katılımcılara gerçek zamanlı bildirilir.",
            "Katılımcı olmayan veya engellenmiş kullanıcı konuşmaya, geçmişe ve mesaj mutasyonlarına erişemez.",
          ]
        : [
            "Only conversation participants can read the conversation and its message history.",
            "A valid message is persisted and returned with stable ordering information.",
            "History can be paginated without missing or duplicating messages.",
            "Invalid, duplicate, and unauthorized requests are rejected consistently.",
            "API contracts are documented for Frontend and QA consumers.",
          ],
      priority: "high",
      rationale: isTr
        ? "Mesaj verisi kullanıcılar arasında hassas içerik taşır ve doğru üyelik kontrolü, kalıcılık, sıralama ve hata davranışı olmadan güvenilir bir frontend deneyimi kurulamaz."
        : "Messages carry sensitive user content, and a reliable frontend cannot be built without membership controls, persistence, ordering, and defined failure behavior.",
      dependsOn: [],
      risks: isTr
        ? ["Gerçek zamanlı iletişim altyapısı ve mesaj saklama politikası henüz doğrulanmamıştır."]
        : ["Real-time infrastructure and message-retention policy have not been confirmed."],
    },
    {
      id: "frontend-messaging-experience",
      type: "frontend",
      title: isTr
        ? "Konuşma Listesi ve Mesajlaşma Deneyimini Geliştir"
        : "Implement the Conversation List and Messaging Experience",
      description: isTr
        ? `Amaç
Kullanıcının gelen kutusundan sohbet seçebildiği, geçmişi inceleyebildiği ve mesajları anlık olarak gönderip alabildiği akıcı, responsive ve erişilebilir frontend deneyimini geliştir.

Kapsam
- Gelen kutusu/konuşma listesi, aktif sohbet penceresi, mesaj balonları, zaman damgaları, okunmamış göstergeleri ve mesaj yazma (composer) alanını geliştir.
- REST/GraphQL API entegrasyonuyla konuşmaları ve mesaj geçmişini getir; cursor pagination veya infinite scroll sırasında sıra ve scroll konumunu koru.
- WebSocket bağlantısını ve state yönetimini kur; gelen mesajları doğru sohbete ekle, bağlantı koptuğunda otomatik reconnect ve geçmiş senkronizasyonu uygula.
- "Yazıyor...", "Gönderildi" ve "Okundu" geri bildirimlerini erişilebilir metin/ikon durumlarıyla göster.
- Loading, empty, validation, sunucu hatası ve offline durumlarını tasarla; gönderilemeyen mesajı görünür tutup "Tekrar Dene" (retry) aksiyonu sun.
- Mobil, tablet ve masaüstü yerleşimlerini; uzun içerik, klavye etkileşimi, focus yönetimi ve ekran okuyucu duyurularını destekle.

Uygulama Notları
Optimistic update kullanılırsa geçici mesaj kimliğini sunucu yanıtıyla uzlaştır, yinelenen gönderimi önle ve sıralamada sunucu zamanını kaynak kabul et. Reconnect sırasında event listener temizliği yaparak çift mesaj oluşmasını engelle.`
        : `Objective
Build an accessible frontend experience for scanning conversations, opening a thread, reviewing history, and sending a new message.

Scope
- Conversation list, unread state, thread view, message groups, and composer components
- Typed integration with backend contracts and paginated history management
- Loading, empty, sending, success, validation, network failure, and retry states
- Responsive behavior, long messages, keyboard interaction, focus management, and screen-reader feedback

Implementation Notes
Prevent duplicate sends. If optimistic updates are used, keep failed messages visible and retryable, and treat server ordering as authoritative.`,
      acceptanceCriteria: isTr
        ? [
            "Kullanıcı gelen kutusundan bir sohbet açabilir; mesaj balonlarını ve zaman damgalarını sunucu sırasına göre görüntüleyebilir.",
            "Eski mesajlar infinite scroll/pagination ile yüklenirken mevcut scroll konumu korunur ve mesajlar tekrarlanmaz.",
            "WebSocket ile gelen mesaj açık sohbete anlık eklenir; farklı sohbete gelen mesaj ilgili okunmamış sayacını günceller.",
            "Bağlantı kesildiğinde durum kullanıcıya gösterilir, istemci otomatik reconnect olur ve kaçırılan mesajları senkronize eder.",
            "Yazıyor, gönderiliyor, gönderildi ve okundu durumları doğru kullanıcı ve mesaj için erişilebilir biçimde gösterilir.",
            "Gönderim hatasında mesaj kaybolmaz; kullanıcı Tekrar Dene aksiyonuyla aynı mesajı yinelenmeden gönderebilir.",
            "Gelen kutusu ve aktif sohbet mobil, tablet ve masaüstünde klavye ve ekran okuyucuyla kullanılabilir.",
          ]
        : [
            "Users can open a conversation and see its history in the correct order.",
            "A valid message is sent once, with visible sending and failure states.",
            "Loading, empty, API failure, and pagination-end states are clear.",
            "Unauthorized or unavailable conversations resolve to a safe error state.",
            "The flow is usable with keyboard and screen reader at supported viewport sizes.",
          ],
      priority: "high",
      rationale: isTr
        ? "Özelliğin kullanıcı değeri konuşmaları bulma, okuma ve mesaj gönderme etkileşimleriyle ortaya çıkar. Frontend kapsamı olmadan backend capability’si kullanıcıya ulaşan bir ürün deneyimine dönüşmez."
        : "The feature’s user value is realized through finding, reading, and sending messages. Backend capability alone does not create a user-facing product experience.",
      dependsOn: ["design-messaging-experience", "backend-messaging-capability"],
    },
    {
      id: "qa-messaging-coverage",
      type: "qa",
      title: isTr
        ? "Mesajlaşma Akışlarını, Yetkilendirmeyi ve Veri Bütünlüğünü Doğrula"
        : "Validate Messaging Flows, Authorization, and Data Integrity",
      description: isTr
        ? `Amaç
Mesajlaşma özelliğinin fonksiyonel, güvenlik, gerçek zamanlılık ve performans davranışlarını uçtan uca doğrula; mesaj kaybı, yinelenme ve yetkisiz veri erişimini engelleyen regression güvencesi oluştur.

Test Kapsamı
- Birebir sohbet, engellenen kullanıcıya mesaj denemesi, silinmiş kullanıcı ve aynı hesabın birden fazla cihaz/sekmede açık olması için test case'leri yaz.
- API testleriyle konuşma ve mesaj response formatlarını, pagination sınırlarını, validation hatalarını ve katılımcı olmayan kullanıcının authorization reddini doğrula.
- Frontend fonksiyonel testlerinde mesaj sırası, loading/empty/error/retry durumları, yazıyor/okundu geri bildirimi ve mobil, tablet, web responsive yerleşimini kontrol et.
- WebSocket/eşzamanlılık testlerinde iki oturum arasında anlık teslimatı, hızlı ardışık mesajları, network drop sonrası reconnect ve kayıpsız senkronizasyonu doğrula.
- Playwright, Cypress veya Selenium ile konuşma başlatma, mesaj gönderme, karşı tarafta alma ve okundu bilgisini kapsayan mutlu yol E2E otomasyonunu oluştur.

Edge Cases
Yinelenen istek/event, sırası değişen yanıt, gecikmeli teslimat, erişimi kaldırılmış katılımcı, çok uzun mesaj ve pagination sınırları veri bütünlüğü açısından kontrol edilmelidir.`
        : `Objective
Verify that messaging works correctly for participants and that messages are not lost, duplicated, or exposed to unauthorized users.

Test Scope
- Conversation creation/listing, history pagination, sending, and retry after failure
- Visibility between participants, membership authorization, and separate user sessions
- Empty/loading/error states, long content, rapid sends, network interruption, and concurrency
- Responsive, keyboard/accessibility, and related user/notification regression coverage

Edge Cases
Check duplicate requests, reordered responses, deleted users, revoked access, and pagination boundaries for data integrity.`,
      acceptanceCriteria: isTr
        ? [
            "Birebir mesajlaşma, engellenen kullanıcı ve çoklu cihaz/sekme senaryolarının test case'leri çalıştırılıp sonuçları kaydedilir.",
            "API testleri geçerli response şemasını, pagination davranışını ve yetkisiz erişimde beklenen 401/403 yanıtlarını doğrular.",
            "Frontend testleri mesaj sırasını, tüm yükleme/hata durumlarını ve mobil, tablet, web responsive görünümü doğrular.",
            "WebSocket ve eşzamanlılık testlerinde mesajlar bir kez ve doğru sırada teslim edilir; network drop sonrası kayıp olmadan senkronize edilir.",
            "Retry, yinelenen event ve hızlı ardışık gönderim testlerinde mesaj kaybı veya çoğalması oluşmaz.",
            "Temel mutlu yol mesajlaşma senaryosu Playwright/Cypress/Selenium ile E2E olarak otomatik çalışır ve regression paketine eklenir.",
          ]
        : [
            "Participants can send and view messages in the correct conversation.",
            "Non-participants cannot access the conversation or messages.",
            "Network failure and retry do not lose or duplicate messages.",
            "Pagination and concurrent-send tests preserve ordering and integrity.",
            "Responsive, accessibility, and related regression checks pass.",
          ],
      priority: "high",
      rationale: isTr
        ? "Mesajlaşmada en yüksek ürün riskleri gizlilik ihlali, mesaj kaybı, yinelenen gönderim ve yanlış sıralamadır. QA kapsamı hem kullanıcı deneyimini hem uçtan uca veri bütünlüğünü doğrulamalıdır."
        : "The highest messaging risks are privacy breaches, lost messages, duplicates, and ordering errors. QA must validate both UX and end-to-end data integrity.",
      dependsOn: ["frontend-messaging-experience", "backend-messaging-capability"],
    },
  ];
  const tasks = allTasks
    .filter((task) => includeDesign || task.type !== "design")
    .map((task) =>
      task.type === "frontend" && !includeDesign
        ? { ...task, dependsOn: ["backend-messaging-capability"] }
        : task,
    );

  return {
    summary: isTr ? "Uygulama İçi Kullanıcı Mesajlaşma Sistemi" : "In-App User Messaging System",
    problemStatement: isTr
      ? "Kullanıcıların ürün içinde diğer yetkili kullanıcılarla bağlamı koruyarak güvenli ve güvenilir biçimde iletişim kurabileceği bir mesajlaşma deneyimi bulunmuyor."
      : "Users lack a secure and reliable in-product experience for communicating with other authorized users while preserving conversation context.",
    userStory: {
      title: isTr ? "Ürün içinde kullanıcılarla mesajlaş" : "Message users within the product",
      description: isTr
        ? "Bir kullanıcı olarak, ilgili kişilerle ürün içinde konuşma başlatmak, geçmiş mesajları görmek ve yeni mesaj göndermek istiyorum; böylece iletişim bağlamını kaybetmeden sürdürebileyim."
        : "As a user, I want to start conversations, review history, and send messages in the product so that I can communicate without losing context.",
    },
    assumptions: isTr
      ? [
          "İlk sürümün bire bir metin mesajlaşmasına odaklandığı varsayılmıştır.",
          "Dosya eki, grup konuşması ve push notification ilk sürüm kapsamı dışında değerlendirilmiştir.",
        ]
      : [
          "The first release is assumed to focus on one-to-one text messaging.",
          "Attachments, groups, editing/deleting, and advanced delivery indicators are treated as out of scope for the first release.",
        ],
    acceptanceCriteria: isTr
      ? [
          "Yetkili kullanıcılar konuşma başlatabilir, geçmişi görüntüleyebilir ve mesaj gönderebilir.",
          "Konuşma içeriği yalnızca ilgili katılımcılara gösterilir.",
          "Mesajlar kalıcı, sıralı ve hata durumlarında güvenli biçimde işlenir.",
          "Temel akışlar responsive ve erişilebilir bir kullanıcı deneyimi sunar.",
        ]
      : [
          "Authorized users can start a conversation, review history, and send messages.",
          "Conversation content is visible only to its participants.",
          "Messages are persisted, ordered, and handled safely during failures.",
          "Core flows provide a responsive and accessible experience.",
        ],
    dependencies: isTr
      ? [
          "Frontend, onaylanan UX akışlarına ve backend API contract’larına bağlıdır.",
          "QA, frontend ve backend teslimatlarının entegre edilebilir ortamda bulunmasına bağlıdır.",
        ]
      : [
          "Frontend depends on approved UX flows and backend API contracts.",
          "QA depends on integrated frontend and backend delivery.",
        ],
    tasks,
    analysis: {
      userProblem: isTr
        ? "Kullanıcılar ürün bağlamından çıkmadan güvenli ve izlenebilir iletişim kuramıyor."
        : "Users cannot communicate securely without leaving the product context.",
      businessGoal: isTr
        ? "Kullanıcılar arasındaki ürün içi iletişimi hızlandırmak ve konuşma bağlamını korumak."
        : "Enable faster in-product communication while preserving conversation context.",
      actor: isTr ? "Kimliği doğrulanmış kullanıcılar" : "Authenticated users",
      desiredOutcome: isTr
        ? "Kullanıcıların konuşma başlatması, geçmişi takip etmesi ve güvenilir biçimde mesaj göndermesi."
        : "Users can start conversations, follow history, and send messages reliably.",
      scope: isTr
        ? ["Bire bir konuşmalar", "Konuşma listesi ve geçmişi", "Metin mesajı gönderimi"]
        : ["One-to-one conversations", "Conversation list and history", "Text messaging"],
      explicitRequirements: [isTr ? "Kullanıcı mesajlaşma özelliği" : "User messaging capability"],
      implicitRequirements: isTr
        ? ["Katılımcı authorization’ı", "Mesaj persistence’ı", "Hata ve retry yönetimi"]
        : ["Participant authorization", "Message persistence", "Failure and retry handling"],
      functionalRequirements: isTr
        ? ["Konuşma başlatma", "Konuşmaları listeleme", "Geçmişi görme", "Mesaj gönderme"]
        : ["Start conversations", "List conversations", "View history", "Send messages"],
      nonFunctionalRequirements: isTr
        ? ["Gizlilik ve authorization", "Kararlı mesaj sıralaması", "Responsive ve accessibility"]
        : ["Privacy and authorization", "Stable message ordering", "Responsive accessibility"],
      risks: isTr
        ? [
            "Yetkisiz mesaj erişimi",
            "Yinelenen veya kaybolan mesajlar",
            "Gerçek zamanlı altyapı belirsizliği",
          ]
        : [
            "Unauthorized message access",
            "Duplicate or lost messages",
            "Unknown real-time infrastructure",
          ],
      ambiguities: isTr
        ? [
            "İlk sürüm bire bir mi yoksa grup konuşmalarını da mı desteklemelidir?",
            "Gerçek zamanlı teslimat, okunma bilgisi, bildirim ve mesaj saklama politikası netleştirilmelidir.",
          ]
        : [
            "Should the first release support only one-to-one or also group conversations?",
            "Real-time delivery, read state, notifications, and retention policy require decisions.",
          ],
    },
    repositoryContext: input.repositoryContext,
    capabilityAnalysis: [
      {
        capability: isTr ? "Mesajlaşma API ve persistence" : "Messaging API and persistence",
        status: "requires_validation",
        rationale: isTr
          ? "Mevcut conversation/message modeli, veri deposu veya API contract’ı sağlanan context içinde doğrulanmamıştır."
          : "No existing conversation/message model, store, or API contract is confirmed.",
      },
      {
        capability: isTr
          ? "Kullanıcı ve katılımcı authorization’ı"
          : "User and participant authorization",
        status: input.repositoryContext?.authentication ? "requires_validation" : "unknown",
        rationale: isTr
          ? "Kimlik doğrulama ile konuşma üyeliği kontrolünün birlikte nasıl uygulanacağı doğrulanmalıdır."
          : "Authentication and conversation-membership enforcement must be validated together.",
      },
      {
        capability: isTr ? "Frontend mesajlaşma deneyimi" : "Frontend messaging experience",
        status: "missing",
        rationale: isTr
          ? "Gereksinim yeni bir kullanıcı etkileşimi talep ediyor; mevcut ekran veya component kanıtı bulunmuyor."
          : "The requirement asks for a new user interaction and no existing UI is evidenced.",
      },
      {
        capability: isTr ? "Gerçek zamanlı teslimat" : "Real-time delivery",
        status: "unknown",
        rationale: isTr
          ? "WebSocket, SSE, push veya polling altyapısı hakkında bilgi sağlanmamıştır."
          : "No WebSocket, SSE, push, or polling capability was supplied.",
      },
    ],
    workstreamDecisions: [
      {
        workstream: "design",
        status: includeDesign ? "required" : "recommended",
        rationale: isTr
          ? includeDesign
            ? "Kullanıcı Design/Tasarım kapsamını açıkça istemiştir; mesajlaşma akışları ayrı bir tasarım teslimatı gerektirir."
            : "Mesajlaşma çoklu state ve etkileşim kararı içerir; ancak açıkça istenmediği için ayrı Task yerine Frontend kapsamında uygulanabilir, mevcut design system ile çözülmesi önerilir."
          : includeDesign
            ? "The user explicitly requested Design scope, so messaging flows need a dedicated design deliverable."
            : "Messaging benefits from interaction design, but without an explicit request it can be handled within Frontend using the existing design system.",
      },
      {
        workstream: "frontend",
        status: "required",
        rationale: isTr
          ? "Kullanıcı değeri konuşma listesi, thread ve composer arayüzleri üzerinden sunulur."
          : "User value is delivered through conversation list, thread, and composer interfaces.",
      },
      {
        workstream: "backend",
        status: "required",
        rationale: isTr
          ? "Mesaj persistence’ı, üyelik authorization’ı ve API contract’ları gereklidir."
          : "Message persistence, membership authorization, and API contracts are required.",
      },
      {
        workstream: "qa",
        status: "required",
        rationale: isTr
          ? "Gizlilik, veri bütünlüğü, hata ve eşzamanlılık senaryoları uçtan uca doğrulanmalıdır."
          : "Privacy, integrity, failure, and concurrency require end-to-end validation.",
      },
      {
        workstream: "analytics",
        status: "recommended",
        rationale: isTr
          ? "Aktivasyon ve gönderim başarısı ölçülebilir; event kapsamı ürün metriği belirlendikten sonra netleşmelidir."
          : "Activation and send success can be measured once product metrics are defined.",
      },
    ],
    warnings: [],
    language: input.language,
    featureType: "new_feature",
    epicRecommendation: {
      recommended: true,
      title: isTr ? "Uygulama İçi Kullanıcı Mesajlaşma Sistemi" : "In-App User Messaging System",
      description: isTr
        ? `Kullanıcı Hikayesi (User Story)
Bir platform kullanıcısı olarak, diğer kullanıcılarla uygulama üzerinden güvenli ve anlık biçimde iletişim kurmak istiyorum; böylece ürün bağlamından ayrılmadan bilgi alışverişi yapabilir ve konuşma geçmişimi takip edebilirim.

Hedef
Kullanıcıların birebir sohbet başlatabilmesi, mesaj gönderip alabilmesi, sayfalı mesaj geçmişini görüntüleyebilmesi ve gönderildi/okundu durumlarını takip edebilmesi için gerekli uçtan uca sistemi geliştirmek.

Kapsam
Epic; Conversations, Messages ve Participants veri modelini, güvenli API'leri, WebSocket tabanlı gerçek zamanlı iletişimi, responsive ve erişilebilir gelen kutusu/sohbet arayüzünü ve API, eşzamanlılık, ağ kesintisi ile E2E kalite kontrollerini kapsar. Grup konuşmaları, dosya ekleri ve push notification ayrıca onaylanmadıkça ilk sürüm kapsamı dışındadır.`
        : `User Story
As a platform user, I want to communicate with other users securely and in real time without leaving the application so that I can exchange information and retain conversation context.

Goal
Deliver the end-to-end capability for starting one-to-one conversations, sending and receiving messages, reviewing paginated history, and tracking sent/read state.

Scope
The Epic covers Conversations, Messages, and Participants data models, secure APIs, WebSocket delivery, an accessible responsive inbox/thread experience, and API, concurrency, network interruption, and E2E quality coverage. Group conversations, attachments, and push notifications are out of scope unless approved separately.`,
      acceptanceCriteria: isTr
        ? [
            "Yetkili kullanıcılar bire bir konuşma başlatabilir ve mesaj alışverişi yapabilir.",
            "Konuşma geçmişi kalıcı, doğru sıralı ve yalnızca katılımcılara görünürdür.",
            "Temel kullanıcı akışları hata, empty/loading, responsive ve accessibility durumlarını kapsar.",
            "Gizlilik, veri bütünlüğü ve regression testleri tamamlanmıştır.",
          ]
        : [
            "Authorized users can start one-to-one conversations and exchange messages.",
            "History is persisted, correctly ordered, and visible only to participants.",
            "Core flows cover failure, empty/loading, responsive, and accessible states.",
            "Privacy, integrity, and regression validation is complete.",
          ],
    },
    labels: ["user-messaging", "conversation", "communication"],
  };
}
