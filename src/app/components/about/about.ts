import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { CountUpDirective } from '../../shared/count-up.directive';

@Component({
  selector: 'app-about',
  imports: [RevealDirective, CountUpDirective, RouterLink],
  templateUrl: './about.html',
})
export class AboutComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
