import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-services-page',
  imports: [RouterLink],
  templateUrl: './services.html',
})
export class ServicesPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
