import type { FieldDef } from '../collections.config';

export interface LocalizedText { uk: string; en: string }

export const blankLoc = (): LocalizedText => ({ uk: '', en: '' });

/** True when the Ukrainian text exists but the English one is empty. */
export function isMissingEn(v: unknown): boolean {
  if (!v || typeof v !== 'object') return false;
  const { uk, en } = v as Partial<LocalizedText>;
  return !!uk?.trim() && !en?.trim();
}

function sectionsMissing(sections: unknown): boolean {
  if (!Array.isArray(sections)) return false;
  return sections.some(
    (s) =>
      isMissingEn(s?.heading) || isMissingEn(s?.text) || isMissingEn(s?.textAfter) ||
      (Array.isArray(s?.items) && s.items.some(isMissingEn)),
  );
}

/** Whether a single field of the model has a UK value without an EN counterpart. */
export function fieldMissingEn(field: FieldDef, value: unknown): boolean {
  switch (field.kind) {
    case 'localized':
    case 'localizedMultiline':
      return isMissingEn(value);
    case 'localizedList':
      return Array.isArray(value) && value.some(isMissingEn);
    case 'sections':
      return sectionsMissing(value);
    default:
      return false;
  }
}

/** Labels of fields whose English translation is missing (never blocks saving). */
export function missingTranslations(fields: FieldDef[], model: Record<string, unknown>): string[] {
  return fields.filter((f) => fieldMissingEn(f, model[f.key])).map((f) => f.label);
}

/** Display value in `lang`, falling back to the other language, for lists/search. */
export function pickLoc(v: unknown, lang: 'uk' | 'en' = 'uk'): string {
  if (!v || typeof v !== 'object') return '';
  const { uk = '', en = '' } = v as Partial<LocalizedText>;
  return (lang === 'uk' ? uk || en : en || uk) ?? '';
}

/** Move an array item (pure). */
export function moveItem<T>(arr: readonly T[], from: number, to: number): T[] {
  const next = [...arr];
  if (from < 0 || from >= next.length || to < 0 || to >= next.length) return next;
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
