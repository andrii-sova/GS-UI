import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-portfolio',
  imports: [RevealDirective, RouterLink],
  templateUrl: './portfolio.html',
})
export class PortfolioComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
