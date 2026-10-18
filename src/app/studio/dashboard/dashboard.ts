import { ChangeDetectionStrategy, Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudioApi } from '../studio-api';
import { COLLECTIONS, apiPathOf, listLink } from '../collections.config';
import { AuthService } from '../../core/auth/auth.service';
import { T } from '../studio-i18n';
import { WEBSITE_BASE, WEBSITE_TABS } from '../studio-nav';

@Component({
  selector: 'app-studio-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="st-page-head">
      <div>
        <h1 class="st-h1">{{ t.dashboard.title }}</h1>
        <p class="st-help">{{ t.dashboard.welcome(auth.user()?.displayName ?? '') }}</p>
      </div>
      <a routerLink="/studio/website" class="st-btn st-btn-primary">{{ t.dashboard.openSite }}</a>
    </div>

    <h2 class="st-label" style="margin-bottom:.6rem">{{ t.dashboard.content }}</h2>
    <div style="display:grid;gap:.9rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">
      @for (c of collections; track c.key) {
        <a [routerLink]="link(c)" class="st-card" style="text-decoration:none;color:inherit;display:block">
          <div class="st-ico" style="font-size:1.6rem" aria-hidden="true">{{ c.icon }}</div>
          <div style="font-weight:600;margin-top:.4rem">{{ c.title }}</div>
          <div class="st-help">{{ countLabel(c.key) }}</div>
        </a>
      }
    </div>

    <h2 class="st-label" style="margin:1.5rem 0 .6rem">{{ t.dashboard.other }}</h2>
    <div style="display:flex;flex-wrap:wrap;gap:.5rem">
      @for (t of otherTabs; track t.path) {
        <a [routerLink]="[base, t.sub ? t.sub[0].path : t.path]" class="st-btn">
          <span class="st-ico" aria-hidden="true">{{ t.icon }}</span> {{ t.label }}
        </a>
      }
    </div>
  `,
})
export class StudioDashboardComponent {
  private readonly api = inject(StudioApi);
  protected readonly auth = inject(AuthService);
  protected readonly t = T;
  protected readonly base = WEBSITE_BASE;
  readonly collections = COLLECTIONS.filter((c) => !c.singleton && c.key !== 'project-categories');
  protected readonly otherTabs = WEBSITE_TABS.filter((t) =>
    ['media', 'numbers', 'coverage', 'contacts', 'legal'].includes(t.path),
  );

  link(c: (typeof COLLECTIONS)[number]): string[] { return listLink(c); }

  countLabel(key: string): string {
    const n = this.counts.value()?.[key];
    if (n == null) return '…';
    return T.dashboard.count(n);
  }

  readonly counts = resource({
    loader: async () => {
      const entries = await Promise.all(
        this.collections.map(async (c) => {
          try {
            const items = await this.api.list<unknown[]>(apiPathOf(c));
            return [c.key, items.length] as const;
          } catch {
            return [c.key, 0] as const;
          }
        }),
      );
      return Object.fromEntries(entries) as Record<string, number>;
    },
  });
}
