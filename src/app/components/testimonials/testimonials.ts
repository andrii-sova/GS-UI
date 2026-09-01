import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
})
export class TestimonialsComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);
}
