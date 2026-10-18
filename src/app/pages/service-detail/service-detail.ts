import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';
import { GallerySliderComponent } from '../../shared/gallery-slider';

@Component({
  selector: 'app-service-detail-page',
  imports: [RouterLink, GallerySliderComponent],
  templateUrl: './service-detail.html',
})
export class ServiceDetailPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly service = computed(
    () => this.content.services().find((s) => s.slug === this.slug()) ?? null,
  );

  /** Main image first, then the extra gallery images. */
  readonly images = computed(() => {
    const s = this.service();
    if (!s) return [];
    return [...(s.imageUrl ? [s.imageUrl] : []), ...(s.gallery ?? [])];
  });
}
