import { Component, inject } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-privacy-page',
  imports: [RevealDirective],
  templateUrl: './privacy.html',
})
export class PrivacyPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
  readonly page = this.content.privacy;
}
