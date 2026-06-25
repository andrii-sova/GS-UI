import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
})
export class ServicesComponent {
  readonly lang = inject(LangService);
}
