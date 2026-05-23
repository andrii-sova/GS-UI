import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
})
export class AboutComponent {
  stats = [
    { value: '15+', label: '[Label: Metal processing technologies — cutting to welding]' },
    { value: '25+', label: '[Label: Units of equipment for precision, speed and consistency]' },
    { value: '100%', label: '[Label: Own full production cycle from idea to finished product]' },
  ];
}
