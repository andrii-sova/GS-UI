import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-blog-page',
  imports: [RouterLink],
  templateUrl: './blog.html',
})
export class BlogPageComponent {
  readonly lang = inject(LangService);
}
