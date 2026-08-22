import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-terms-page',
  templateUrl: './terms.html',
})
export class TermsPageComponent {
  readonly lang = inject(LangService);
}
