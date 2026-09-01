import { Pipe, PipeTransform, inject } from '@angular/core';
import { LangService } from '../services/lang.service';

const LOCALES: Record<string, string> = { uk: 'uk-UA', en: 'en-GB' };

/**
 * Formats an ISO date (`2026-03-14`) or `Date` for the active UI language via
 * `Intl.DateTimeFormat` — never a hardcoded format.
 */
@Pipe({ name: 'localizedDate', pure: false })
export class LocalizedDatePipe implements PipeTransform {
  private readonly lang = inject(LangService);

  transform(
    value: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' },
  ): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(LOCALES[this.lang.lang()] ?? 'uk-UA', options).format(date);
  }
}
