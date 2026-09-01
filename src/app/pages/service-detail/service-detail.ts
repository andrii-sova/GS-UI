import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-service-detail-page',
  imports: [RouterLink],
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
}
