import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewEncapsulation, computed, inject, signal, viewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { buildCrumbs } from '../studio-nav';
import { T } from '../studio-i18n';
import { ToastHostComponent } from '../shared/toast';
import { ConfirmHostComponent } from '../shared/confirm';

const COLLAPSE_KEY = 'gs-studio-sidebar-collapsed';

interface NavItem { label: string; icon: string; link: string; match: string }

const NAV: NavItem[] = [
  { label: T.shell.nav.dashboard, icon: '📊', link: '/studio/dashboard', match: '/studio/dashboard' },
  { label: T.shell.nav.website, icon: '🌐', link: '/studio/website', match: '/studio/website' },
  { label: T.shell.nav.users, icon: '👥', link: '/studio/users', match: '/studio/users' },
  { label: T.shell.nav.account, icon: '⚙️', link: '/studio/account', match: '/studio/account' },
];

function readCollapsed(): boolean {
  try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; }
}

@Component({
  selector: 'app-studio-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['../studio.css', '../studio-cards.css', '../studio-forms.css', '../studio-shell.css', '../studio-loc.css'],
  imports: [RouterOutlet, RouterLink, ToastHostComponent, ConfirmHostComponent],
  template: `
    <div class="st-root" [class.collapsed]="collapsed()">
      <a href="#studio-main" class="st-skip">{{ t.shell.skip }}</a>

      @if (drawerOpen()) {
        <div class="st-backdrop" (click)="drawerOpen.set(false)" aria-hidden="true"></div>
      }

      <aside class="st-side" [class.open]="drawerOpen()" id="studio-sidebar">
        <div style="display:flex;align-items:center;gap:.7rem;height:56px;padding:0 1.1rem;border-bottom:1px solid rgba(255,255,255,.08)">
          <span class="st-avatar" style="background:var(--coral)" aria-hidden="true">G</span>
          <div class="st-brand-text" style="line-height:1.2">
            <div style="color:#fff;font-weight:700;font-size:.95rem">Galicia Steel</div>
            <div style="font-size:.72rem;color:#8fa6b5">{{ t.shell.sidebarBrand }}</div>
          </div>
        </div>

        <nav [attr.aria-label]="t.shell.modules" style="flex:1;overflow-y:auto;padding-top:.6rem">
          @for (n of nav; track n.link) {
            <a class="st-side-link" [routerLink]="n.link" [class.active]="isActive(n)"
               [attr.aria-current]="isActive(n) ? 'page' : null" [attr.title]="collapsed() ? n.label : null"
               [attr.aria-label]="n.label">
              <span class="ico" aria-hidden="true">{{ n.icon }}</span>
              <span class="st-side-label">{{ n.label }}</span>
            </a>
          }
        </nav>

        <div style="padding:.6rem;border-top:1px solid rgba(255,255,255,.08)">
          <button type="button" class="st-side-link st-only-desktop" style="width:calc(100% - 1.2rem);background:transparent;border:0;cursor:pointer;font:inherit"
                  (click)="toggleCollapsed()" [attr.aria-pressed]="collapsed()"
                  [attr.aria-label]="collapsed() ? t.shell.expandAria : t.shell.collapseAria">
            <span class="ico" aria-hidden="true">{{ collapsed() ? '»' : '«' }}</span>
            <span class="st-side-label">{{ t.shell.collapse }}</span>
          </button>
        </div>
      </aside>

      <div class="st-main">
        <header class="st-topbar">
          <button type="button" class="st-icon-btn st-only-mobile" (click)="drawerOpen.set(!drawerOpen())"
                  [attr.aria-label]="t.shell.openMenu" aria-controls="studio-sidebar" [attr.aria-expanded]="drawerOpen()">☰</button>

          <nav [attr.aria-label]="t.shell.breadcrumb" style="flex:1;min-width:0">
            <ol class="st-crumbs">
              @for (c of crumbs(); track $index; let last = $last) {
                <li [attr.aria-current]="last ? 'page' : null">
                  @if (c.link && !last) { <a [routerLink]="c.link">{{ c.label }}</a> } @else { {{ c.label }} }
                </li>
                @if (!last) { <li aria-hidden="true">/</li> }
              }
            </ol>
          </nav>

          <div style="position:relative">
            <button type="button" #menuBtn class="st-btn st-btn-ghost" style="gap:.55rem;padding:0 .4rem"
                    aria-haspopup="menu" [attr.aria-expanded]="menuOpen()" (click)="menuOpen.set(!menuOpen())"
                    data-testid="user-menu">
              <span class="st-avatar" aria-hidden="true">{{ initial() }}</span>
              <span class="st-only-desktop" style="font-weight:600">{{ auth.user()?.displayName }}</span>
              <span class="st-visually-hidden st-only-mobile">{{ t.shell.accountMenu }}</span>
            </button>
            @if (menuOpen()) {
              <div class="st-menu" role="menu" [attr.aria-label]="t.shell.account">
                <div style="padding:.5rem .65rem .6rem;border-bottom:1px solid var(--border);margin-bottom:.3rem">
                  <div style="font-weight:600;font-size:.875rem">{{ auth.user()?.displayName }}</div>
                  <div class="st-help" style="word-break:break-all">{{ auth.user()?.email }}</div>
                </div>
                <a role="menuitem" routerLink="/studio/account" (click)="menuOpen.set(false)">{{ t.shell.myAccount }}</a>
                <a role="menuitem" routerLink="/" target="_blank" rel="noopener">{{ t.shell.viewSite }}</a>
                <button type="button" role="menuitem" (click)="logout()">{{ t.shell.signOut }}</button>
              </div>
            }
          </div>
        </header>

        <div id="studio-main" role="main" tabindex="-1" class="st-content">
          <router-outlet />
        </div>
      </div>

      <app-toast-host />
      <app-confirm-host />
    </div>
  `,
})
export class StudioShellComponent {
  readonly auth = inject(AuthService);
  protected readonly t = T;
  private readonly router = inject(Router);
  private readonly menuBtn = viewChild<ElementRef<HTMLButtonElement>>('menuBtn');

  protected readonly nav = NAV;
  readonly collapsed = signal(readCollapsed());
  readonly drawerOpen = signal(false);
  readonly menuOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => {
        this.drawerOpen.set(false);
        this.menuOpen.set(false);
        return (e as NavigationEnd).urlAfterRedirects;
      }),
    ),
    { initialValue: this.router.url },
  );

  readonly crumbs = computed(() => buildCrumbs(this.url()));
  readonly initial = computed(() => (this.auth.user()?.displayName ?? '?').trim().charAt(0).toUpperCase());

  isActive(n: NavItem): boolean {
    const u = this.url().split(/[?#]/)[0];
    return u === n.match || u.startsWith(n.match + '/');
  }

  toggleCollapsed(): void {
    const next = !this.collapsed();
    this.collapsed.set(next);
    try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch { /* storage unavailable */ }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      this.menuBtn()?.nativeElement.focus();
    }
    this.drawerOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.menuBtn()?.nativeElement.parentElement?.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }

  async logout(): Promise<void> {
    this.menuOpen.set(false);
    try {
      await this.auth.logout();
    } catch {
      /* session is cleared client-side regardless */
    } finally {
      await this.router.navigateByUrl('/studio/login');
    }
  }
}
