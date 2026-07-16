import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LangService } from '../../services/lang.service';
import { RegionsMapComponent } from '../../components/regions-map/regions-map';
import { EuropeMapComponent } from '../../components/europe-map/europe-map';

@Component({
  selector: 'app-portfolio-page',
  imports: [RouterLink, RegionsMapComponent, EuropeMapComponent],
  templateUrl: './portfolio.html',
})
export class PortfolioPageComponent {
  readonly lang = inject(LangService);
}
