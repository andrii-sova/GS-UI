import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs/operators';
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
  private readonly router = inject(Router);

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
