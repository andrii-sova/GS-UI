import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-portfolio-page',
  imports: [RouterLink],
  templateUrl: './portfolio.html',
})
export class PortfolioPageComponent {
  categories = [
    '[Category: All]',
    '[Category: Industrial]',
    '[Category: Architectural]',
    '[Category: Decorative]',
    '[Category: Defence]',
  ];

  projects = [
    {
      name: '[Project: Fountain Cladding]',
      category: '[Category: Architectural]',
      description: '[Text: Modelled cladding for easy transport and assembly. Engraving aided sheet positioning.]',
      image: '[image of fountain cladding project]',
    },
    {
      name: '[Project: Airport Turnstiles — Charles de Gaulle, Paris]',
      category: '[Category: Industrial]',
      description: '[Text: Access control turnstiles and ventilation equipment for CDG airport.]',
      image: '[image of airport turnstiles]',
    },
    {
      name: '[Project: Hydroxy Housing]',
      category: '[Category: Industrial]',
      description: '[Text: Enclosure with mounts for engine oxygen cleaning.]',
      image: '[image of Hydroxy housing]',
    },
    {
      name: '[Project: Designer Handles]',
      category: '[Category: Decorative]',
      description: '[Text: Unique metal handles for a hotel in Lviv — precision meets aesthetics.]',
      image: '[image of designer handles]',
    },
    {
      name: '[Project: Electrical Enclosure]',
      category: '[Category: Industrial]',
      description: '[Text: Custom series enclosure with cable entries, fan mounts and cut-out logo.]',
      image: '[image of electrical enclosure]',
    },
    {
      name: '[Project: Spiral Staircase]',
      category: '[Category: Architectural]',
      description: '[Text: Designer spiral staircase with unique engraving on each step.]',
      image: '[image of spiral staircase]',
    },
    {
      name: '[Project: AC Protection Covers]',
      category: '[Category: Architectural]',
      description: '[Text: Metal facade covers for air conditioners — reliable, aesthetic, weather-resistant.]',
      image: '[image of AC protection covers]',
    },
    {
      name: '[Project: Cyclone System]',
      category: '[Category: Industrial]',
      description: '[Text: Built to client sketches for industrial production.]',
      image: '[image of cyclone system]',
    },
    {
      name: '[Project: Outdoor Sink for Garden Gazebo]',
      category: '[Category: Decorative]',
      description: '[Text: Custom metal sink combining functionality and durability for outdoor use.]',
      image: '[image of outdoor sink]',
    },
  ];
}
