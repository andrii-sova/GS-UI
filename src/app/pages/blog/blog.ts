import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/reveal.directive';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { LocalizedDatePipe } from '../../shared/localized-date.pipe';

@Component({
  selector: 'app-blog-page',
  imports: [RouterLink, LocalizedDatePipe, RevealDirective],
  templateUrl: './blog.html',
})
export class BlogPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
