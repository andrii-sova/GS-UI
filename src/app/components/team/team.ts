import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { RevealDirective } from '../../shared/reveal.directive';
import { CountUpDirective } from '../../shared/count-up.directive';

@Component({
  selector: 'app-team',
  imports: [RevealDirective, CountUpDirective, RouterLink],
  templateUrl: './team.html',
})
export class TeamComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
