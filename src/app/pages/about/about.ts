import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink],
  templateUrl: './about.html',
})
export class AboutPageComponent {
  readonly lang = inject(LangService);
}
