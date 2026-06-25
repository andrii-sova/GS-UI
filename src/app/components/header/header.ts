import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService, Theme } from '../../services/theme.service';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly lang = inject(LangService);

  readonly themes: { id: Theme; label: string; icon: string }[] = [
    { id: 'darker',  label: 'Darker',  icon: '●' },
    { id: 'normal',  label: 'Normal',  icon: '◑' },
    { id: 'lighter', label: 'Lighter', icon: '○' },
  ];
}
