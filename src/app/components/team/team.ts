import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-team',
  imports: [RouterLink],
  templateUrl: './team.html',
})
export class TeamComponent {
  readonly lang = inject(LangService);
}
