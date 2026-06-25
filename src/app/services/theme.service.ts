import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'lighter' | 'normal' | 'darker';

const VALID_THEMES: Theme[] = ['lighter', 'normal', 'darker'];
const STORAGE_KEY = 'gs-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.setAttribute('data-theme', t);
      try {
        localStorage.setItem(STORAGE_KEY, t);
      } catch {}
    });
  }

  setTheme(t: Theme): void {
    this.theme.set(t);
  }

  private getInitialTheme(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme;
      if (VALID_THEMES.includes(saved)) return saved;
    } catch {}
    return 'normal';
  }
}
