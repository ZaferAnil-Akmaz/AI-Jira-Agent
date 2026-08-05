import type { GenerateRequest } from "@/lib/validation/schemas";
import type { AIProvider } from "@/server/providers/ai/types";
import type {
  FeatureType,
  OutputLanguage,
  TaskType,
  WorkBreakdown,
  WorkTask,
} from "@/types/domain";

type Feature = {
  tr: string;
  en: string;
  actorTr: string;
  actorEn: string;
  labels: string[];
  hasUi: boolean;
  hasBackend: boolean;
};
const tr = (language: OutputLanguage) => language === "tr";

function detectType(text: string): FeatureType {
  const value = text.toLowerCase();
  if (/bug|hata|çalışmıyor|güncellenmiyor/.test(value)) return "bug";
  if (/iyileştir|improve|enhance/.test(value)) return "enhancement";
  if (/bakım|maintenance|refactor|migrate/.test(value)) return "maintenance";
  if (
    /api|endpoint|database|veri modeli|infrastructure/.test(value) &&
    !/sayfa|ekran|page|screen|ui/.test(value)
  )
    return "technical_task";
  return "new_feature";
}
function feature(input: GenerateRequest): Feature {
  const value = `${input.requirement} ${input.context}`.toLowerCase();
  const tracking =
    /beslenme|nutrition/.test(value) && /antreman|antrenman|workout|exercise/.test(value);
  if (tracking)
    return {
      tr: "Beslenme ve Antrenman Takip Sayfası",
      en: "Nutrition & Workout Tracking Page",
      actorTr: "Kullanıcılar",
      actorEn: "Users",
      labels: ["nutrition-tracking", "workout-tracking"],
      hasUi: true,
      hasBackend: /api|endpoint|kaydet|oluştur|create|update|güncelle|veri modeli/.test(value),
    };
  if (/antreman|antrenman|workout|exercise/.test(value))
    return {
      tr: "Antrenman Takip Sayfası",
      en: "Workout Tracking Page",
      actorTr: "Kullanıcılar",
      actorEn: "Users",
      labels: ["workout-tracking"],
      hasUi: true,
      // Data source, persistence and user ownership are unknown; explicitly plan their assessment.
      hasBackend: true,
    };
  const campaign = /kampanya|campaign/.test(value) && /durum|status/.test(value);
  if (campaign)
    return {
      tr: "Kampanya Durum Yönetimi",
      en: "Campaign Status Management",
      actorTr: "Partnerler",
      actorEn: "Partners",
      labels: ["campaign-management", "campaign-status"],
      hasUi: true,
      hasBackend: true,
    };
  const words = input.requirement
    .toLocaleLowerCase("tr")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(
      (word) =>
        ![
          "kullanıcıların",
          "kullanıcı",
          "için",
          "yeni",
          "bir",
          "sayfa",
          "geliştirmeyi",
          "istiyorum",
          "the",
          "a",
          "an",
          "for",
          "to",
          "and",
          "want",
        ].includes(word),
    );
  const concept =
    words
      .slice(0, 4)
      .map((word) => word.charAt(0).toLocaleUpperCase("tr") + word.slice(1))
      .join(" ") || "Ürün Akışı";
  const title = `${concept} Deneyimi`;
  return {
    tr: title.length > 90 ? `${title.slice(0, 87)}…` : title,
    en: title.length > 90 ? `${title.slice(0, 87)}…` : title,
    actorTr: "Kullanıcılar",
    actorEn: "Users",
    labels: ["product-feature"],
    hasUi: /sayfa|ekran|page|screen|ui|kullanıcı|user/.test(value),
    hasBackend: /api|endpoint|kaydet|oluştur|create|update|güncelle|database|veri modeli/.test(
      value,
    ),
  };
}
function usesRedWhite(context: string) {
  return /kırmızı|red/.test(context.toLowerCase()) && /beyaz|white/.test(context.toLowerCase());
}
function work(type: TaskType, f: Feature, language: OutputLanguage, themed: boolean): WorkTask {
  const isTr = tr(language);
  const title = isTr ? f.tr : f.en;
  const trackingFeature = f.tr === "Beslenme ve Antrenman Takip Sayfası";
  const workoutOnly = f.tr === "Antrenman Takip Sayfası";
  const subjectTr = trackingFeature ? "Beslenme ve antrenman" : workoutOnly ? "Antrenman" : title;
  const subjectEn = trackingFeature ? "Nutrition and workout" : workoutOnly ? "Workout" : title;
  const themeTr = themed
    ? " Kırmızı ve beyaz ana tema, mevcut design system ile uyumlu biçimde uygulanmalıdır."
    : "";
  const themeEn = themed
    ? " Apply the red and white visual theme consistently within the existing design system."
    : "";
  const tasks: Record<TaskType, Omit<WorkTask, "id" | "type">> = {
    design: {
      title: isTr ? `${title} Kullanıcı Deneyimi Tasarımı` : `Design the ${title} Experience`,
      description: isTr
        ? `Objective\n${subjectTr} bilgilerini anlaşılır biçimde takip etmeyi sağlayacak UX/UI deneyimini oluştur.\n\nScope\n- Bilgi mimarisi, kayıt listesi ve detay görünümü\n- Empty, loading, error ve responsive durumları\n- Accessibility ve mevcut design system kullanımı\n\nImplementation Notes\nBilgi yoğunluğunu taranabilir bir hiyerarşiyle sun; kullanıcı akışını belirsiz verileri uydurmadan mevcut domain bilgisine göre tasarla.${themeTr}`
        : `Objective\nCreate a UX/UI experience that makes ${subjectEn.toLowerCase()} information easy to follow.\n\nScope\n- Information architecture, record list, and detail view\n- Empty, loading, error, and responsive states\n- Accessibility and the existing design system\n\nImplementation Notes\nUse a scannable hierarchy and base the flow on known domain information without inventing missing data.${themeEn}`,
      acceptanceCriteria: isTr
        ? [
            `${subjectTr} alanları ve durumları tasarımda tanımlıdır.`,
            "Responsive ve accessibility davranışları belirtilmiştir.",
          ]
        : [
            `${subjectEn} sections and their states are specified.`,
            "Responsive and accessibility behavior is documented.",
          ],
      priority: "medium",
    },
    frontend: {
      title: isTr ? `${title} Frontend Geliştirmesi` : `Implement the ${title} Frontend`,
      description: isTr
        ? `Objective\nOnaylanan tasarıma göre ${title.toLowerCase()} geliştir ve kullanıcıya ait ilgili verileri anlaşılır biçimde sun.\n\nScope\n- Sayfa yapısı, kayıt listesi ve gerekiyorsa detay görünümü\n- Mevcut veya onaylanan API contract'ına data mapping\n- Empty, loading, error ve responsive UI davranışları\n\nEdge Cases\nBoş sonuç, API isteği hatası, eksik/null alanlar ve uzun kayıt listeleri ele alınmalıdır.${themeTr}`
        : `Objective\nImplement the ${title} from the approved design and clearly present the user's relevant data.\n\nScope\n- Page structure, record list, and detail view where needed\n- Data mapping against the existing or approved API contract\n- Empty, loading, error, and responsive UI states\n\nEdge Cases\nHandle empty results, API failures, missing/null fields, and long record lists.${themeEn}`,
      acceptanceCriteria: isTr
        ? [
            `${subjectTr} verileri anlaşılır alanlarda gösterilir.`,
            "Empty, loading ve error state'leri uygulanmıştır.",
            "Sayfa desteklenen ekran boyutlarında kullanılabilirdir.",
          ]
        : [
            `${subjectEn} data is presented in clear sections.`,
            "Empty, loading, and error states are implemented.",
            "The page works at supported viewport sizes.",
          ],
      priority: "high",
    },
    backend: {
      title: isTr
        ? `${title} Veri Altyapısının Değerlendirilmesi ve Geliştirilmesi`
        : `Assess and Implement ${title} Data Capability`,
      description: isTr
        ? `Objective\n${subjectTr} sayfasının ihtiyaç duyduğu verinin güvenli ve sürdürülebilir şekilde sunulmasını sağla.\n\nScope\n- Mevcut data source, model, service ve API capability'lerini incele\n- Kullanıcı-veri ilişkisi, persistence, business logic ve API contract ihtiyacını değerlendir\n- Yalnızca eksik capability varsa endpoint, validation, authorization ve error handling geliştir\n\nImplementation Notes\nMevcut capability tekrar geliştirilmemeli; frontend için gereken minimum veri seti ve erişim kuralları açıkça tanımlanmalıdır.\n\nEdge Cases\nYetkisiz erişim, geçersiz veri, bulunamayan kayıt ve boş geçmiş ele alınmalıdır.`
        : `Objective\nEnsure the data needed by the ${subjectEn.toLowerCase()} page is delivered securely and sustainably.\n\nScope\n- Inspect existing data sources, models, services, and API capabilities\n- Assess user-data ownership, persistence, business logic, and API-contract needs\n- Implement endpoints, validation, authorization, and error handling only for missing capability\n\nImplementation Notes\nDo not rebuild existing capability. Define the minimum data set and access rules needed by the frontend.\n\nEdge Cases\nHandle unauthorized access, invalid data, missing records, and an empty history.`,
      acceptanceCriteria: isTr
        ? [
            "Gerekli veri contract'ı UI ihtiyacını karşılar.",
            "Yeni endpoint gerekiyorsa authorization ve validation uygulanmıştır.",
          ]
        : [
            "The required data contract supports the UI need.",
            "If a new endpoint is required, authorization and validation are implemented.",
          ],
      priority: "high",
    },
    qa: {
      title: isTr
        ? `${title} Fonksiyonel ve Veri Doğruluğu Testleri`
        : `Test ${title} Functionality and Data Accuracy`,
      description: isTr
        ? `Objective\n${subjectTr} akışının fonksiyonel davranışını, veri doğruluğunu ve hata yönetimini doğrula.\n\nTest Scope\n- Veri render edilmesi, boş geçmiş ve hata durumları\n- API response ile UI verisinin tutarlılığı\n- Responsive davranış, authorization ve ilgili regression kontrolleri\n\nEdge Cases\nEksik alanlar, yetkisiz erişim ve API failure senaryoları test edilmelidir.`
        : `Objective\nValidate ${subjectEn.toLowerCase()} flow functionality, data accuracy, and error handling.\n\nTest Scope\n- Data rendering, empty history, and error states\n- Consistency between API responses and UI data\n- Responsive behavior, authorization, and relevant regression checks\n\nEdge Cases\nTest missing fields, unauthorized access, and API-failure scenarios.`,
      acceptanceCriteria: isTr
        ? [
            `${subjectTr} verileri doğru gösterilir.`,
            "State ve responsive senaryoları doğrulanmıştır.",
            "Mevcut fonksiyonlarda regression kontrolü yapılmıştır.",
          ]
        : [
            `${subjectEn} data displays correctly.`,
            "State and responsive scenarios are verified.",
            "Regression impact on existing functionality is checked.",
          ],
      priority: "medium",
      dependencies: f.hasBackend ? ["frontend", "backend"] : ["frontend"],
    },
    analytics: {
      title: isTr ? `${title} Kullanım Analitiği` : `Measure ${title} Usage`,
      description: isTr
        ? "Sayfa görüntüleme ve temel etkileşim event'lerini, yalnızca ürün metriği ihtiyacı doğrulanırsa tanımla."
        : "Define page-view and key interaction events only if product measurement is required.",
      acceptanceCriteria: isTr
        ? ["Gerekli event'ler dokümante edilmiştir."]
        : ["Required events are documented."],
      priority: "low",
    },
  };
  return { id: type, type, ...tasks[type] };
}

export class MockAIProvider implements AIProvider {
  async generateWorkBreakdown(input: GenerateRequest): Promise<WorkBreakdown> {
    const isTr = tr(input.language);
    const f = feature(input);
    const type = detectType(input.requirement);
    const theme = usesRedWhite(input.context);
    const teams: TaskType[] =
      type === "technical_task"
        ? ["backend", "qa"]
        : f.hasUi
          ? ["design", "frontend", ...(f.hasBackend ? (["backend"] as TaskType[]) : []), "qa"]
          : ["backend", "qa"];
    const title = isTr ? f.tr : f.en;
    const workoutOnly = f.tr === "Antrenman Takip Sayfası";
    const subjectTr = workoutOnly ? "antrenman" : "beslenme ve antrenman";
    const subjectEn = workoutOnly ? "workout" : "nutrition and workout";
    return {
      summary: title,
      problemStatement: isTr
        ? `${f.actorTr} ${subjectTr} takip bilgilerini tek bir anlaşılır sayfada görüntülemek istiyor.`
        : `${f.actorEn} need to view ${subjectEn} tracking information in one clear page.`,
      userStory: {
        title: isTr ? `${title} sun` : `Provide ${title}`,
        description: isTr
          ? `${f.actorTr} olarak ${subjectTr} takibimi tek sayfadan görmek istiyorum.`
          : `As a user, I want to review my ${subjectEn} tracking from one page.`,
      },
      assumptions: workoutOnly
        ? [
            isTr
              ? "İlk sürümün kullanıcıya ait mevcut antrenman kayıtlarını görüntülemeye odaklandığı; veri kaynağının doğrulanması gerektiği varsayılmıştır."
              : "The first version is assumed to focus on viewing existing user-specific workout records; the data source must be validated.",
          ]
        : f.hasBackend
          ? [
              isTr
                ? "Mevcut data source ve kullanıcı-veri ilişkisinin doğrulanması gerektiği varsayılmıştır."
                : "The existing data source and user-data relationship must be validated.",
            ]
          : [
              isTr
                ? `Mevcut API'lerin ${subjectTr} verisini sağladığı varsayılmıştır.`
                : `Existing APIs are assumed to provide ${subjectEn} data.`,
            ],
      acceptanceCriteria: isTr
        ? [
            `${subjectTr.charAt(0).toLocaleUpperCase("tr") + subjectTr.slice(1)} takip bilgileri anlaşılır biçimde görüntülenir.`,
            "Empty, loading ve error durumları kullanıcıya gösterilir.",
          ]
        : [
            `${subjectEn.charAt(0).toUpperCase() + subjectEn.slice(1)} tracking information is displayed clearly.`,
            "Empty, loading, and error states are shown to the user.",
          ],
      dependencies: teams.includes("backend")
        ? isTr
          ? [
              "Frontend, veri contract'ı için backend'e bağlıdır.",
              "QA, frontend ve backend teslimatlarını doğrular.",
            ]
          : [
              "Frontend depends on the backend data contract.",
              "QA verifies frontend and backend delivery.",
            ]
        : isTr
          ? ["QA, frontend teslimatını doğrular."]
          : ["QA verifies frontend delivery."],
      tasks: teams.map((team) => work(team, f, input.language, theme)),
      analysis: {
        userProblem: isTr
          ? `${subjectTr.charAt(0).toLocaleUpperCase("tr") + subjectTr.slice(1)} takip bilgileri için anlaşılır bir kullanıcı yüzeyi bulunmuyor.`
          : `There is no clear user surface for ${subjectEn.toLowerCase()} tracking information.`,
        businessGoal: isTr
          ? "Takip verilerini anlaşılır ve güvenilir bir deneyimde sunmak."
          : "Present tracking information in a clear and reliable experience.",
        actor: isTr ? f.actorTr : f.actorEn,
        functionalRequirements: isTr
          ? workoutOnly
            ? ["Antrenman kayıtları ve mevcut detay bilgileri gösterilir."]
            : ["Beslenme takip alanı gösterilir.", "Antrenman takip alanı gösterilir."]
          : workoutOnly
            ? ["Show workout records and available detail information."]
            : ["Show a nutrition tracking section.", "Show a workout tracking section."],
        nonFunctionalRequirements: theme
          ? isTr
            ? [
                "Kırmızı ve beyaz tema mevcut design system ile uyumlu uygulanır.",
                "Responsive ve accessible davranış sağlanır.",
              ]
            : [
                "Apply the red and white theme within the existing design system.",
                "Provide responsive and accessible behavior.",
              ]
          : [
              isTr
                ? "Responsive ve accessible davranış sağlanır."
                : "Provide responsive and accessible behavior.",
            ],
        risks: workoutOnly
          ? [
              isTr
                ? "Mevcut antrenman veri kaynağı, kullanıcı sahipliği ve API contract'ı henüz doğrulanmamıştır."
                : "The existing workout data source, user ownership, and API contract are not yet confirmed.",
            ]
          : f.hasBackend
            ? []
            : [
                isTr
                  ? "Mevcut veri kaynaklarının sayfa için yeterliliği doğrulanmalıdır."
                  : "Existing data sources must be validated for the page.",
              ],
        ambiguities: workoutOnly
          ? [
              isTr
                ? "Kullanıcıların hangi antrenman bilgisini (ör. egzersiz, set/tekrar, süre, geçmiş veya ilerleme) takip edeceği netleştirilmelidir."
                : "Clarify which workout information users should track, such as exercises, sets/repetitions, duration, history, or progress.",
            ]
          : f.hasBackend
            ? []
            : [
                isTr
                  ? "Yeni backend/API capability'sine ihtiyaç olup olmadığı mevcut veri kaynakları incelendikten sonra netleştirilmelidir."
                  : "Whether new backend/API capability is needed must be confirmed after reviewing existing data sources.",
              ],
      },
      language: input.language,
      featureType: type,
      epicRecommendation:
        type === "new_feature"
          ? {
              recommended: true,
              title,
              description: isTr
                ? `${f.actorTr.toLocaleLowerCase("tr")}ın ${subjectTr.toLocaleLowerCase("tr")} aktivitelerini takip edebileceği ${title.toLowerCase()} geliştirilmesi.`
                : `Build ${title} so ${f.actorEn.toLowerCase()} can review ${subjectEn.toLowerCase()} activity in one place.`,
              acceptanceCriteria: isTr
                ? [
                    `${subjectTr} takip alanları kullanıma sunulmuştur.`,
                    "Planlanan UI state'leri ve kalite kontrolleri tamamlanmıştır.",
                  ]
                : [
                    `${subjectEn} tracking sections are available.`,
                    "Planned UI states and quality checks are complete.",
                  ],
            }
          : null,
      labels: [...f.labels, ...(theme ? ["red-white-theme"] : [])],
    };
  }
}
