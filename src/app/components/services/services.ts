import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [RouterLink],
  templateUrl: './services.html',
})
export class ServicesComponent {
  services = [
    {
      slug: 'laser-cutting',
      name: '[Service: Laser Cutting]',
      description: '[Text: Precision 0.1mm on complex parts. Steel, stainless, aluminium, copper and titanium.]',
      image: '[image of laser cutting machine]',
    },
    {
      slug: 'metal-bending',
      name: '[Service: Metal Bending]',
      description: '[Text: CNC press brakes for parts up to 4 m. Perfect geometry, repeatability, no cracks.]',
      image: '[image of metal bending / press brake]',
    },
    {
      slug: 'turning',
      name: '[Service: Turning Works]',
      description: '[Text: From serial parts to prototypes. CNC and 5-axis centres for precise surfaces, holes and threads.]',
      image: '[image of CNC lathe / turning machine]',
    },
    {
      slug: 'milling',
      name: '[Service: Milling Works]',
      description: '[Text: From serial parts to prototypes. CNC and 5-axis centres for precise surfaces, holes and threads.]',
      image: '[image of CNC milling machine]',
    },
    {
      slug: 'welding',
      name: '[Service: Metal Welding]',
      description: '[Text: TIG, MIG, laser welding. Seams that withstand time and load. Small parts to large structures.]',
      image: '[image of welding / welder at work]',
    },
    {
      slug: 'laser-engraving',
      name: '[Service: Laser Engraving]',
      description: '[Text: Logos, serial numbers and inscriptions on metal, wood, plastic or glass.]',
      image: '[image of laser engraving on metal]',
    },
    {
      slug: 'powder-coating',
      name: '[Service: Powder Coating]',
      description: '[Text: Smooth, durable finish resistant to moisture, sun and harsh conditions.]',
      image: '[image of powder coating booth / painted metal parts]',
    },
  ];
}
