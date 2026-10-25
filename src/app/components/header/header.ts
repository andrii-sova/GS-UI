import { Component, ElementRef, HostListener, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';

// Fully transparent at the very top of the hero, ramping up to a fully
// solid background by the time the user has scrolled halfway through it.
const HERO_FADE_FRACTION = 0.5;

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class HeaderComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly menuOpen = signal(false);
  readonly isHome = signal(this.router.url === '/');
  readonly scrollY = signal(typeof window !== 'undefined' ? window.scrollY : 0);
  // Height of the homepage hero section, in px; 0 until it's been measured.
  readonly heroHeight = signal(0);

  // Non-home routes have no hero to fade over, so they're always solid.
  // On the homepage, opacity ramps linearly from 0 at scrollY 0 up to 1
  // once scrollY reaches the midpoint of the hero section.
  readonly headerBgOpacity = computed(() => {
    if (!this.isHome()) return 1;
    const hero = this.heroHeight();
    if (hero <= 0) return 0;
    return Math.min(this.scrollY() / (hero * HERO_FADE_FRACTION), 1);
  });

  constructor() {
    // Lock page scroll while the mobile menu is open.
    effect((onCleanup) => {
      if (typeof document === 'undefined' || !this.menuOpen()) return;
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      onCleanup(() => (document.body.style.overflow = prev));
    });
    this.measureHero();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isHome.set(this.router.url === '/');
        // The hero (re)mounts asynchronously after navigation resolves.
        setTimeout(() => this.measureHero());
      });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrollY.set(window.scrollY);
    if (this.isHome() && this.heroHeight() === 0) this.measureHero();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.menuOpen() && !this.host.contains(event.target as Node)) this.closeMenu();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.measureHero();
  }

  private measureHero(): void {
    if (typeof document === 'undefined') return;
    const hero = document.querySelector('app-hero');
    this.heroHeight.set(hero instanceof HTMLElement ? hero.getBoundingClientRect().height : 0);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
