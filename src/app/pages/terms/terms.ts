import { Component, inject } from '@angular/core';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-terms-page',
  templateUrl: './terms.html',
})
export class TermsPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
  readonly page = this.content.terms;
}
