import { Injectable, signal, computed, effect } from '@angular/core';
import { UK } from '../i18n/uk';
import { EN } from '../i18n/en';

export type Lang = 'uk' | 'en';

const STORAGE_KEY = 'gs-lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<Lang>(this.getInitialLang());
  readonly dict = computed(() => this.lang() === 'uk' ? UK : EN);

  constructor() {
    effect(() => {
      const l = this.lang();
      document.documentElement.setAttribute('lang', l);
      try { localStorage.setItem(STORAGE_KEY, l); } catch {}
    });
  }

  setLang(l: Lang): void {
    this.lang.set(l);
  }

  private getInitialLang(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'uk' || saved === 'en') return saved;
    } catch {}
    return 'uk';
  }
}
