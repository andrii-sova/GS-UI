import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { LangService } from './services/lang.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly langService = inject(LangService);
  private readonly router = inject(Router);

  // The homepage hero fills the viewport behind the fixed transparent header,
  // so only routes without a hero need their content pushed below it.
  readonly isHome = signal(this.router.url === '/');

  // The studio has its own full-screen chrome — hide the marketing header/footer there.
  readonly isStudio = signal(this.router.url.startsWith('/studio'));

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isHome.set(this.router.url === '/');
        this.isStudio.set(this.router.url.startsWith('/studio'));
      });
  }
}
