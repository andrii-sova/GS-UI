import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-services',
  imports: [RevealDirective, RouterLink],
  templateUrl: './services.html',
})
export class ServicesComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
