import type { GenerateRequest } from "@/lib/validation/schemas";
import type { TaskType, WorkBreakdown, WorkTask } from "@/types/domain";

const messagingPattern = /mesajlaş|mesaj|message|messaging|chat|conversation|inbox/i;
const sectionPattern =
  /(^|\n)(objective|amaç|scope|kapsam|implementation notes|uygulama notları|edge cases?|sınır durumları|test scope|test kapsamı)\s*[:\n]/i;

function expectedWorkstreams(input: GenerateRequest): TaskType[] {
  if (messagingPattern.test(`${input.requirement} ${input.context}`)) {
    return ["frontend", "backend", "qa"];
  }
  return [];
}

function taskQualityIssues(task: WorkTask): string[] {
  const issues: string[] = [];
  if (task.description.trim().length < 220) {
    issues.push(
      `${task.id}: açıklama uygulanabilir planlama detayı içerecek kadar kapsamlı değil.`,
    );
  }
  if (!sectionPattern.test(task.description)) {
    issues.push(`${task.id}: açıklamada Objective/Amaç, Scope/Kapsam veya Test Scope bölümü yok.`);
  }
  if (task.acceptanceCriteria.length < 3) {
    issues.push(`${task.id}: en az üç bağımsız ve test edilebilir kabul kriteri gerekli.`);
  }
  if (task.rationale.trim().length < 40) {
    issues.push(`${task.id}: task gerekçesi ürün/teslimat kararını yeterince açıklamıyor.`);
  }
  return issues;
}

function workstreamText(plan: WorkBreakdown, type: TaskType): string {
  return plan.tasks
    .filter((task) => task.type === type)
    .flatMap((task) => [task.title, task.description, ...task.acceptanceCriteria])
    .join("\n");
}

function requireConcept(issues: string[], text: string, pattern: RegExp, issue: string): void {
  if (!pattern.test(text)) issues.push(issue);
}

function messagingQualityIssues(plan: WorkBreakdown): string[] {
  const issues: string[] = [];
  const epic = plan.epicRecommendation;

  if (epic?.recommended) {
    requireConcept(
      issues,
      epic.description,
      /kullanıcı hikayesi|user story/i,
      "Mesajlaşma Epic açıklamasında açık bir Kullanıcı Hikayesi (User Story) bölümü gerekli.",
    );
    requireConcept(
      issues,
      epic.description,
      /(^|\n)\s*(hedef|goal)\s*[:\n]/i,
      "Mesajlaşma Epic açıklamasında açık bir Hedef/Goal bölümü gerekli.",
    );
  }

  const backend = workstreamText(plan, "backend");
  requireConcept(
    issues,
    backend,
    /conversation|conversation[s]?|konuşma|sohbet/i,
    "Backend kapsamında conversation/sohbet veri modeli eksik.",
  );
  requireConcept(
    issues,
    backend,
    /message[s]?|mesaj/i,
    "Backend kapsamında message/mesaj persistence modeli eksik.",
  );
  requireConcept(
    issues,
    backend,
    /participant|katılımcı/i,
    "Backend kapsamında participant/katılımcı modeli ve yetkisi eksik.",
  );
  requireConcept(
    issues,
    backend,
    /api|endpoint|uç nokta|rest|graphql/i,
    "Backend kapsamında mesajlaşma API uç noktaları eksik.",
  );
  requireConcept(
    issues,
    backend,
    /websocket|socket\.io|signalr|real[- ]?time|gerçek zaman/i,
    "Backend kapsamında gerçek zamanlı iletişim yaklaşımı eksik.",
  );
  requireConcept(
    issues,
    backend,
    /okundu|read receipt|read status/i,
    "Backend kapsamında okundu bilgisi mantığı eksik.",
  );
  requireConcept(
    issues,
    backend,
    /authorization|yetkilendirme|yetki/i,
    "Backend kapsamında konuşma üyeliği yetkilendirmesi eksik.",
  );

  const frontend = workstreamText(plan, "frontend");
  requireConcept(
    issues,
    frontend,
    /inbox|gelen kutusu|konuşma listesi|sohbet listesi/i,
    "Frontend kapsamında gelen kutusu/konuşma listesi eksik.",
  );
  requireConcept(
    issues,
    frontend,
    /composer|mesaj yazma|mesaj oluşturma|mesaj giriş/i,
    "Frontend kapsamında mesaj yazma alanı eksik.",
  );
  requireConcept(
    issues,
    frontend,
    /pagination|sayfalama|infinite scroll/i,
    "Frontend kapsamında mesaj geçmişi sayfalaması eksik.",
  );
  requireConcept(
    issues,
    frontend,
    /websocket|socket|real[- ]?time|gerçek zaman/i,
    "Frontend kapsamında gerçek zamanlı mesaj entegrasyonu eksik.",
  );
  requireConcept(
    issues,
    frontend,
    /reconnect|yeniden bağlan/i,
    "Frontend kapsamında bağlantı yeniden kurma senaryosu eksik.",
  );
  requireConcept(
    issues,
    frontend,
    /typing|yazıyor|okundu|read receipt/i,
    "Frontend kapsamında yazıyor/okundu kullanıcı geri bildirimi eksik.",
  );
  requireConcept(
    issues,
    frontend,
    /retry|tekrar dene|yeniden dene/i,
    "Frontend kapsamında gönderim hatası ve tekrar deneme davranışı eksik.",
  );

  const qa = workstreamText(plan, "qa");
  requireConcept(issues, qa, /api/i, "QA kapsamında API testleri eksik.");
  requireConcept(
    issues,
    qa,
    /authorization|yetkilendirme|yetkisiz/i,
    "QA kapsamında yetkilendirme testleri eksik.",
  );
  requireConcept(
    issues,
    qa,
    /responsive|mobil|tablet|ekran boyut/i,
    "QA kapsamında responsive arayüz testleri eksik.",
  );
  requireConcept(
    issues,
    qa,
    /websocket|eşzaman|concurren|network drop|ağ kesinti/i,
    "QA kapsamında WebSocket/eşzamanlılık ve ağ kesintisi testleri eksik.",
  );
  requireConcept(
    issues,
    qa,
    /e2e|uçtan uca|cypress|playwright|selenium/i,
    "QA kapsamında E2E otomasyon senaryosu eksik.",
  );

  for (const task of plan.tasks.filter((task) =>
    ["backend", "frontend", "qa"].includes(task.type),
  )) {
    if (task.acceptanceCriteria.length < 5) {
      issues.push(
        `${task.id}: mesajlaşma workstream'i için en az beş test edilebilir kabul kriteri gerekli.`,
      );
    }
  }

  return issues;
}

export function findPlanQualityIssues(input: GenerateRequest, plan: WorkBreakdown): string[] {
  const issues: string[] = [];
  const taskTypes = new Set(plan.tasks.map((task) => task.type));

  for (const expected of expectedWorkstreams(input)) {
    if (!taskTypes.has(expected)) {
      issues.push(`Eksik zorunlu workstream: ${expected}.`);
    }
  }

  for (const task of plan.tasks) issues.push(...taskQualityIssues(task));

  if (messagingPattern.test(`${input.requirement} ${input.context}`)) {
    issues.push(...messagingQualityIssues(plan));
  }

  if (plan.featureType === "new_feature") {
    if (!plan.epicRecommendation?.recommended) {
      issues.push("Yeni feature için önerilen bir Epic bulunmuyor.");
    } else {
      if (plan.epicRecommendation.description.trim().length < 180) {
        issues.push(
          "Epic açıklaması amaç, kullanıcı değeri, kapsam ve sınırları yeterince açmıyor.",
        );
      }
      if (plan.epicRecommendation.acceptanceCriteria.length < 3) {
        issues.push("Epic için en az üç feature-seviyesi kabul kriteri gerekli.");
      }
    }
  }

  return issues;
}
