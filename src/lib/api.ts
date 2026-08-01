import type { Benefit, ClassificationResult } from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка сети' }));
    throw new ApiError(res.status, err.detail ?? 'Неизвестная ошибка');
  }
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка сети' }));
    throw new ApiError(res.status, err.detail ?? 'Неизвестная ошибка');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function fetchBenefits(regionId: string, category: string, subcategory: string): Promise<Benefit[]> {
  return apiGet<Benefit[]>(`/benefits?region_id=${regionId}&category=${category}&subcategory=${subcategory}`);
}

export interface GenerateTemplateResult {
  text: string; is_uniqualized: boolean; template_version: string; edit_pct_baseline: number;
}

export async function generateTemplate(params: {
  region_id: string; region_name: string; category: string; subcategory: string; topic?: string;
}): Promise<GenerateTemplateResult> {
  return apiPost<GenerateTemplateResult>('/generate-template', params);
}

export async function classifyResponse(params: {
  original_request: string; official_response: string;
  escalation_count?: number; has_new_facts?: boolean;
  region_id?: string; category?: string; subcategory?: string;
}): Promise<ClassificationResult> {
  return apiPost<ClassificationResult>('/classify-response', params);
}

export async function logSession(params: {
  device_hash: string; region_id: string; category: string; subcategory: string;
  template_version?: string; edit_pct?: number; consent_given?: boolean;
}): Promise<void> {
  return apiPost<void>('/session', params);
}

export async function submitFeedback(params: {
  response_text: string; original_request: string; region_id: string;
  category: string; subcategory: string; system_label: string; user_label: string;
}): Promise<void> {
  return apiPost<void>('/feedback', params);
}

// ── Обратная связь с разработчиками ──────────────────────────────────────

export async function submitDevFeedback(params: {
  message: string;
  category: 'bug' | 'suggestion' | 'other';
  page: string;
}): Promise<void> {
  return apiPost<void>('/dev-feedback', params);
}

export { ApiError };

// ── Модуль «Документы»: официальные бланки госорганов ──────────────────

export async function isDocumentAvailable(category: string, subcategory: string): Promise<boolean> {
  try {
    const res = await apiGet<{ available: boolean }>(`/document-available?category=${category}&subcategory=${subcategory}`);
    return res.available;
  } catch {
    return false;
  }
}

export async function downloadOfficialDocument(params: {
  region_id: string; region_name: string; category: string; subcategory: string; reason_text: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE}/generate-document`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Не удалось сгенерировать документ' }));
    throw new ApiError(res.status, err.detail ?? 'Неизвестная ошибка');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'zayavlenie_pension_pereraschet.docx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
