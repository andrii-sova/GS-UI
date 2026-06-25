import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-services-page',
  imports: [RouterLink],
  templateUrl: './services.html',
})
export class ServicesPageComponent {
  readonly lang = inject(LangService);
}
