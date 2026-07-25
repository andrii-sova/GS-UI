import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink],
  templateUrl: './project-detail.html',
})
export class ProjectDetailPageComponent implements OnInit {
  slug = '';
  readonly activeImage = signal(0);
  readonly lang = inject(LangService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') ?? '';
      this.activeImage.set(0);
    });
  }

  get project() {
    return this.lang.dict().portfolioPage.items.find((p) => p.slug === this.slug);
  }

  prevImage() {
    const total = this.project?.gallery?.length ?? 0;
    if (total > 0) this.activeImage.update(i => (i - 1 + total) % total);
  }

  nextImage() {
    const total = this.project?.gallery?.length ?? 0;
    if (total > 0) this.activeImage.update(i => (i + 1) % total);
  }

  goToImage(index: number) {
    this.activeImage.set(index);
  }
}
