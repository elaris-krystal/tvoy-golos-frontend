import type { Benefit, ClassificationResult, CivicPromise, RegionStats } from '../types';

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

// ── Модуль 3: Трекер обещаний ────────────────────────────────────────────

export async function fetchPromises(regionId: string, statusFilter?: string): Promise<CivicPromise[]> {
  const q = statusFilter ? `&status=${statusFilter}` : '';
  return apiGet<CivicPromise[]>(`/promises?region_id=${regionId}${q}`);
}

export async function createPromise(params: {
  region_id: string; official_name: string; official_role: string;
  promise_text: string; source_url: string; promise_date?: string; device_hash: string;
  accuracy_confirmed: boolean;
}): Promise<CivicPromise> {
  return apiPost<CivicPromise>('/promises', params);
}

export async function votePromise(
  promiseId: number,
  vote: 'fulfilled' | 'broken',
  voterHash: string,
): Promise<CivicPromise> {
  return apiPost<CivicPromise>(`/promises/${promiseId}/vote`, { vote, voter_hash: voterHash });
}

export async function disputePromise(
  promiseId: number,
  reason: 'not_in_source' | 'fabricated' | 'other',
  disputerHash: string,
): Promise<void> {
  return apiPost<void>(`/promises/${promiseId}/dispute`, { reason, disputer_hash: disputerHash });
}

export async function fetchRegionStats(regionId: string): Promise<RegionStats> {
  return apiGet<RegionStats>(`/promises/stats?region_id=${regionId}`);
}

export { ApiError };
