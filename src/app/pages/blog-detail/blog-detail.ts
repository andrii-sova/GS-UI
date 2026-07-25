import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-blog-detail-page',
  imports: [RouterLink],
  templateUrl: './blog-detail.html',
})
export class BlogDetailPageComponent implements OnInit {
  slug = '';
  readonly lang = inject(LangService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') ?? '';
    });
  }

  get post() {
    return this.lang.dict().blogPage.items.find((p) => p.slug === this.slug);
  }
}
