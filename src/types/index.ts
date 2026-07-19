export interface Region {
  id: string;
  name: string;
}

export type CategoryKey =
  | 'family' | 'employment' | 'health'
  | 'housing' | 'education' | 'pension' | 'labor';

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  key: string;
  label: string;
}

// Совпадает с BenefitOut в backend
export interface Benefit {
  id: number;
  benefit_name: string;
  description: string;
  legal_basis: string;
  source_url?: string;
  is_federal: boolean;
}

// Совпадает с ClassifyOut в backend
export interface ClassificationResult {
  classification: 'отписка' | 'слабый ответ' | 'частичный ответ' | 'ответ по существу';
  score: number;
  markers: Record<string, number>;
  explanation_user: string;
  suggested_grounds: string[];
  escalation_warning: boolean;
  escalation_warning_text?: string;
  used_llm: boolean;
}

export type CaseStatus = 'waiting' | 'received' | 'escalated' | 'resolved';

export interface ActiveCase {
  id: string;
  topic: string;
  region: string;
  category: CategoryKey;
  subcategory: string;
  date_sent: string;
  date_expected: string;
  status: CaseStatus;
  reminder_date?: string;
  classification?: string;
  escalation_count: number;
}

export interface LocalReminder {
  id: string;
  case_id: string;
  remind_at: string;
  dismissed: boolean;
}

// Уровни идентификации (ТЗ v1.4)
export type IdentificationLevel = 0 | 1 | 2;

// Модуль 3: трекер обещаний
export type PromiseStatus = 'checking' | 'fulfilled' | 'broken';

export interface CivicPromise {
  id: number;
  region_id: string;
  official_name: string;
  official_role: string;
  promise_text: string;
  source_url: string;
  promise_date?: string;
  status: PromiseStatus;
  votes_fulfilled: number;
  votes_broken: number;
  dispute_count: number;
  created_at: string;
}

export interface RegionStats {
  region_id: string;
  total_promises: number;
  fulfilled_count: number;
  broken_count: number;
  checking_count: number;
}
