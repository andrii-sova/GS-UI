import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { T } from '../studio-i18n';
import { WEBSITE_BASE, WEBSITE_TABS, activeSub, activeTab } from '../studio-nav';

/** Модуль «Публічний сайт»: вкладки з вмістом; кожне текстове поле редагується обома мовами. */
@Component({
  selector: 'app-website-workspace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet],
  template: `
    <nav class="st-tabs" data-testid="website-tabs" [attr.aria-label]="t.shell.nav.website">
      @for (t of tabs; track t.path) {
        <a class="st-tab" [routerLink]="link(t.sub ? t.sub[0].path : t.path)"
           [attr.aria-current]="current()?.path === t.path ? 'page' : null"
           [attr.data-testid]="'tab-' + t.path">{{ t.label }}</a>
      }
    </nav>

    @if (current()?.sub; as subs) {
      <nav class="st-seg" style="margin-bottom:1.1rem" [attr.aria-label]="current()!.label">
        @for (s of subs; track s.path) {
          <a [routerLink]="link(s.path)" [attr.aria-current]="sub()?.path === s.path ? 'page' : null"
             [attr.data-testid]="'sub-' + s.path">{{ s.label }}</a>
        }
      </nav>
    }

    <router-outlet />
  `,
})
export class WebsiteWorkspaceComponent {
  private readonly router = inject(Router);
  protected readonly t = T;

  protected readonly base = WEBSITE_BASE;

  /** Route commands with one segment per path part, so nested paths aren't %2F-encoded. */
  protected link(path: string): string[] {
    return [this.base, ...path.split('/')];
  }
  protected readonly tabs = WEBSITE_TABS;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly current = computed(() => activeTab(this.url()));
  protected readonly sub = computed(() => activeSub(this.current(), this.url()));
}
