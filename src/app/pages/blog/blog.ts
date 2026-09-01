import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-blog-page',
  imports: [RouterLink],
  templateUrl: './blog.html',
})
export class BlogPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
