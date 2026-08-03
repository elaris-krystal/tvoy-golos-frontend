import type { ActiveCase } from '../types';

/**
 * Генерирует .ics-файл (стандарт RFC 5545) с напоминанием о сроке ответа
 * по обращению — так пользователь может добавить его в календарь телефона
 * (Google/Apple/Outlook Calendar), и получит уведомление независимо от того,
 * откроет ли он снова само приложение. Наш внутренний баннер в «Дневнике»
 * работает только если человек сам зайдёт в приложение — календарь телефона
 * напомнит проактивно, что особенно важно для категорий вроде пенсии
 * и здоровья, где аудитория чаще может забыть про формальный срок.
 *
 * Полностью локальная генерация в браузере — файл не уходит никуда,
 * кроме как в календарь самого пользователя.
 */

function toIcsDate(dateStr: string): string {
  // YYYY-MM-DD -> YYYYMMDD (формат "весь день" в ICS, без времени/таймзоны)
  return dateStr.replace(/-/g, '');
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function utf8ByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

function foldLine(line: string): string {
  // RFC 5545: строки сворачиваются по 75 ОКТЕТАМ (байтам UTF-8), не по
  // символам JS-строки — для кириллицы (2 байта/символ) простой .length
  // пропустил бы строки, реально вдвое превышающие лимит спецификации.
  if (utf8ByteLength(line) <= 75) return line;
  const chunks: string[] = [];
  let rest = line;
  while (utf8ByteLength(rest) > 75) {
    // ищем максимальную по числу символов границу, укладывающуюся в 75 байт,
    // не разрезая многобайтовый символ пополам
    let cut = 75;
    while (cut > 0 && utf8ByteLength(rest.slice(0, cut)) > 75) cut--;
    chunks.push(rest.slice(0, cut));
    rest = ' ' + rest.slice(cut);
  }
  chunks.push(rest);
  return chunks.join('\r\n');
}

export function generateIcsForCase(activeCase: ActiveCase): string {
  const uid = `${activeCase.id}@tvoy-golos.local`;
  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const summary = escapeIcsText(`Проверить ответ: ${activeCase.topic}`);
  const description = escapeIcsText(
    `Истекает срок ответа госоргана (30 дней по ст. 5 ФЗ №59-ФЗ) на обращение из приложения «Твой Голос». ` +
    `Регион: ${activeCase.region}. Если ответа нет или он формальный — откройте приложение, чтобы подготовить эскалацию.`
  );

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tvoy Golos//Case Reminder//RU',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${toIcsDate(activeCase.date_expected)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:PT9H', // напоминание в 9:00 в день события (по умолчанию календаря)
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

export function downloadIcsForCase(activeCase: ActiveCase): void {
  const content = generateIcsForCase(activeCase);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `napominanie-${activeCase.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
