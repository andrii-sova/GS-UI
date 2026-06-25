import { Component, inject } from '@angular/core';
import { HeroComponent } from '../../components/hero/hero';
import { ServicesComponent } from '../../components/services/services';
import { AboutComponent } from '../../components/about/about';
import { CtaBannerComponent } from '../../components/cta-banner/cta-banner';
import { PartnersComponent } from '../../components/partners/partners';
import { PortfolioComponent } from '../../components/portfolio/portfolio';
import { TestimonialsComponent } from '../../components/testimonials/testimonials';
import { ProcessComponent } from '../../components/process/process';
import { TeamComponent } from '../../components/team/team';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    ServicesComponent,
    AboutComponent,
    CtaBannerComponent,
    PartnersComponent,
    PortfolioComponent,
    TestimonialsComponent,
    ProcessComponent,
    TeamComponent,
  ],
  templateUrl: './home.html',
})
export class HomeComponent {
  readonly lang = inject(LangService);
}
