import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cta-banner',
  imports: [RouterLink],
  templateUrl: './cta-banner.html',
})
export class CtaBannerComponent {
  @Input() heading = '[Heading: Ready to start your project?]';
  @Input() subtext = '[Text: Contact us for a quote and get a real price and timeline today.]';
  @Input() buttonLabel = '[Button → Get a Quote]';
  @Input() buttonLink = '/contact';
  @Input() backgroundImage = '[image of metal product / workshop scene]';
}
