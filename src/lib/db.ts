import { openDB, type IDBPDatabase } from 'idb';
import type { ActiveCase, LocalReminder } from '../types';

const DB_NAME = 'tvoy-golos';
const DB_VERSION = 1;
let db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('active_cases')) {
        const s = database.createObjectStore('active_cases', { keyPath: 'id' });
        s.createIndex('by_status', 'status');
        s.createIndex('by_date', 'date_sent');
      }
      if (!database.objectStoreNames.contains('local_reminders')) {
        const s = database.createObjectStore('local_reminders', { keyPath: 'id' });
        s.createIndex('by_case', 'case_id');
        s.createIndex('by_date', 'remind_at');
      }
    },
  });
  return db;
}

export async function addCase(c: ActiveCase): Promise<void> {
  await (await getDB()).put('active_cases', c);
}
export async function getCases(): Promise<ActiveCase[]> {
  return (await getDB()).getAll('active_cases');
}
export async function getCaseById(id: string): Promise<ActiveCase | undefined> {
  return (await getDB()).get('active_cases', id);
}
export async function updateCase(c: ActiveCase): Promise<void> {
  await (await getDB()).put('active_cases', c);
}
export async function deleteCase(id: string): Promise<void> {
  await (await getDB()).delete('active_cases', id);
}
export async function addReminder(r: LocalReminder): Promise<void> {
  await (await getDB()).put('local_reminders', r);
}
export async function getReminders(): Promise<LocalReminder[]> {
  return (await getDB()).getAll('local_reminders');
}
export async function getDueReminders(): Promise<LocalReminder[]> {
  const all = await getReminders();
  const today = new Date().toISOString().split('T')[0];
  return all.filter(r => !r.dismissed && r.remind_at <= today);
}
export async function dismissReminder(id: string): Promise<void> {
  const database = await getDB();
  const r = await database.get('local_reminders', id);
  if (r) await database.put('local_reminders', { ...r, dismissed: true });
}

export function generateId(): string { return crypto.randomUUID(); }

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Стабильный анонимный идентификатор устройства.
 * Хранится в localStorage — не персональные данные, просто случайная строка
 * для защиты от повторного голосования / накрутки в Модуле 3.
 */
export function getDeviceHash(): string {
  const KEY = 'tvoy-golos-device-hash';
  let hash = localStorage.getItem(KEY);
  if (!hash) {
    hash = crypto.randomUUID();
    localStorage.setItem(KEY, hash);
  }
  return hash;
}

export function calcEditPct(original: string, edited: string): number {
  if (!original) return 0;
  const o = original.split(/\s+/);
  const e = edited.split(/\s+/);
  let diff = Math.abs(o.length - e.length);
  const min = Math.min(o.length, e.length);
  for (let i = 0; i < min; i++) if (o[i] !== e[i]) diff++;
  return Math.round((diff / o.length) * 100);
}
