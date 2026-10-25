import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-footer',
  imports: [RevealDirective, RouterLink],
  templateUrl: './footer.html',
})
export class FooterComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
