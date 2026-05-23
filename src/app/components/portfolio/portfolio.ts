import { Component } from '@angular/core';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.html',
})
export class PortfolioComponent {
  projects = [
    {
      name: '[Project: Fountain Cladding]',
      description: '[Text: Modelled cladding for easy transport and assembly. Engraving aided sheet positioning.]',
      image: '[image of fountain cladding project]',
    },
    {
      name: '[Project: Airport Turnstiles — Charles de Gaulle, Paris]',
      description: '[Text: Access control turnstiles and ventilation equipment for CDG airport.]',
      image: '[image of airport turnstiles]',
    },
    {
      name: '[Project: Hydroxy Housing]',
      description: '[Text: Enclosure with mounts for engine oxygen cleaning. Reliable in demanding conditions.]',
      image: '[image of Hydroxy housing / industrial enclosure]',
    },
    {
      name: '[Project: Designer Handles]',
      description: '[Text: Unique metal handles for a hotel in Lviv — precision meets aesthetics.]',
      image: '[image of designer door handles / metal handles]',
    },
    {
      name: '[Project: Electrical Enclosure]',
      description: '[Text: Custom series enclosure with cable entries, fan mounts and cut-out logo.]',
      image: '[image of electrical enclosure / control box]',
    },
    {
      name: '[Project: Spiral Staircase]',
      description: '[Text: Designer spiral staircase with unique engraving on each step forming one story.]',
      image: '[image of spiral staircase]',
    },
    {
      name: '[Project: AC Protection Covers]',
      description: '[Text: Metal facade covers for air conditioners — reliable, aesthetic, weather-resistant.]',
      image: '[image of AC protection covers / metal grille on building facade]',
    },
    {
      name: '[Project: Cyclone System]',
      description: '[Text: Built to client sketches for industrial production — accurate, efficient.]',
      image: '[image of industrial cyclone / dust collector]',
    },
    {
      name: '[Project: Outdoor Sink for Garden Gazebo]',
      description: '[Text: Custom metal sink combining functionality and durability for outdoor use.]',
      image: '[image of outdoor metal sink / utility sink]',
    },
  ];
}
