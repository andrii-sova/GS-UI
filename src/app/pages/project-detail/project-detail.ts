import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GallerySliderComponent } from '../../shared/gallery-slider';
import { RevealDirective } from '../../shared/reveal.directive';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink, GallerySliderComponent, RevealDirective],
  templateUrl: './project-detail.html',
})
export class ProjectDetailPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly project = computed(
    () => this.content.projects().find((p) => p.slug === this.slug()) ?? null,
  );
}
