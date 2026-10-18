import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { GallerySliderComponent } from '../../shared/gallery-slider';
import { LocalizedDatePipe } from '../../shared/localized-date.pipe';

@Component({
  selector: 'app-blog-detail-page',
  imports: [RouterLink, LocalizedDatePipe, GallerySliderComponent],
  templateUrl: './blog-detail.html',
})
export class BlogDetailPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly post = computed(
    () => this.content.blog().find((p) => p.slug === this.slug()) ?? null,
  );

  /** Main image first, then the extra gallery images. */
  readonly images = computed(() => {
    const p = this.post();
    if (!p) return [];
    return [...(p.imageUrl ? [p.imageUrl] : []), ...(p.gallery ?? [])];
  });
}
