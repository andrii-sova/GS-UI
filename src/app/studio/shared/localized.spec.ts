import { describe, expect, it } from 'vitest';
import { isMissingEn, missingTranslations, moveItem, pickLoc } from './localized';
import type { FieldDef } from '../collections.config';

describe('localized helpers', () => {
  it('detects missing EN only when UK is filled', () => {
    expect(isMissingEn({ uk: 'а', en: '' })).toBe(true);
    expect(isMissingEn({ uk: 'а', en: 'a' })).toBe(false);
    expect(isMissingEn({ uk: '', en: '' })).toBe(false);
    expect(isMissingEn(null)).toBe(false);
  });

  it('lists fields with a missing translation, including lists and sections', () => {
    const fields: FieldDef[] = [
      { key: 'a', label: 'A', kind: 'localized' },
      { key: 'b', label: 'B', kind: 'localizedList' },
      { key: 'c', label: 'C', kind: 'sections' },
      { key: 'd', label: 'D', kind: 'text' },
    ];
    const model = {
      a: { uk: 'x', en: 'x' },
      b: [{ uk: 'y', en: '' }],
      c: [{ heading: { uk: 'h', en: 'h' }, text: { uk: '', en: '' }, items: [{ uk: 'i', en: '' }], textAfter: { uk: '', en: '' } }],
      d: 'text',
    };
    expect(missingTranslations(fields, model)).toEqual(['B', 'C']);
  });

  it('picks with fallback and moves items', () => {
    expect(pickLoc({ uk: '', en: 'e' }, 'uk')).toBe('e');
    expect(pickLoc({ uk: 'u', en: '' }, 'en')).toBe('u');
    expect(moveItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
  });
});
