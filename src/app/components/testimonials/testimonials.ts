import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.html',
})
export class TestimonialsComponent {
  readonly lang = inject(LangService);
}
