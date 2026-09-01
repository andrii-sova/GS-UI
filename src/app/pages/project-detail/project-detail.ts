import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-project-detail-page',
  imports: [RouterLink],
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

  readonly activeImage = signal(0);

  constructor() {
    effect(() => {
      this.slug();
      this.activeImage.set(0);
    });
  }

  private get galleryLength(): number {
    return this.project()?.gallery.length ?? 0;
  }

  prevImage(): void {
    const total = this.galleryLength;
    if (total > 0) this.activeImage.update((i) => (i - 1 + total) % total);
  }

  nextImage(): void {
    const total = this.galleryLength;
    if (total > 0) this.activeImage.update((i) => (i + 1) % total);
  }

  goToImage(index: number): void {
    this.activeImage.set(index);
  }
}
