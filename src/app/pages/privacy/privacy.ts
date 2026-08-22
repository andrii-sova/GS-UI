import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-privacy-page',
  templateUrl: './privacy.html',
})
export class PrivacyPageComponent {
  readonly lang = inject(LangService);
}
