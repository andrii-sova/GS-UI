import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink],
  templateUrl: './about.html',
})
export class AboutPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
