import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-portfolio-page',
  imports: [RouterLink],
  templateUrl: './portfolio.html',
})
export class PortfolioPageComponent {
  readonly lang = inject(LangService);
}
