import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Service {
  slug: string;
  name: string;
  description: string;
  image: string;
  details: string[];
}

@Component({
  selector: 'app-services-page',
  imports: [RouterLink],
  templateUrl: './services.html',
})
export class ServicesPageComponent {
  services: Service[] = [
    {
      slug: 'laser-cutting',
      name: '[Service: Laser Cutting]',
      description: '[Text: Precision 0.1mm on complex parts. Steel, stainless, aluminium, copper and titanium.]',
      image: '[image of laser cutting machine]',
      details: [
        '[Detail: Materials — steel, stainless steel, aluminium, copper, titanium]',
        '[Detail: Thickness range — up to Xmm depending on material]',
        '[Detail: Tolerance — 0.1mm]',
      ],
    },
    {
      slug: 'metal-bending',
      name: '[Service: Metal Bending]',
      description: '[Text: CNC press brakes for parts up to 4 m. Perfect geometry, repeatability, no cracks.]',
      image: '[image of metal bending / press brake]',
      details: [
        '[Detail: CNC press brakes up to 4 m]',
        '[Detail: High repeatability for batch production]',
      ],
    },
    {
      slug: 'turning',
      name: '[Service: Turning Works]',
      description: '[Text: From serial parts to prototypes. CNC and 5-axis centres for precise surfaces, holes and threads.]',
      image: '[image of CNC lathe / turning machine]',
      details: [
        '[Detail: CNC turning centres]',
        '[Detail: Serial and prototype runs]',
      ],
    },
    {
      slug: 'milling',
      name: '[Service: Milling Works]',
      description: '[Text: From serial parts to prototypes. CNC and 5-axis centres for precise surfaces, holes and threads.]',
      image: '[image of CNC milling machine]',
      details: [
        '[Detail: 5-axis CNC milling]',
        '[Detail: Complex geometry parts]',
      ],
    },
    {
      slug: 'welding',
      name: '[Service: Metal Welding]',
      description: '[Text: TIG, MIG, laser welding. Seams that withstand time and load. Small parts to large structures.]',
      image: '[image of welding / welder at work]',
      details: [
        '[Detail: TIG / MIG / Laser welding]',
        '[Detail: Small details to large assemblies]',
      ],
    },
    {
      slug: 'laser-engraving',
      name: '[Service: Laser Engraving]',
      description: '[Text: Logos, serial numbers and inscriptions on metal, wood, plastic or glass.]',
      image: '[image of laser engraving on metal]',
      details: [
        '[Detail: Metal, wood, plastic, glass]',
        '[Detail: Logos, serials, decorative texts]',
      ],
    },
    {
      slug: 'powder-coating',
      name: '[Service: Powder Coating]',
      description: '[Text: Smooth, durable finish resistant to moisture, sun and harsh conditions.]',
      image: '[image of powder coating booth / painted metal parts]',
      details: [
        '[Detail: Wide colour palette]',
        '[Detail: UV / weather / corrosion resistant]',
      ],
    },
  ];
}
