import { Component } from '@angular/core';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.html',
})
export class PartnersComponent {
  partners = [
    { name: '[Partner 1 name]', logo: '[logo of partner / military unit 1]' },
    { name: '[Partner 2 name]', logo: '[logo of partner / military unit 2]' },
    { name: '[Partner 3 name]', logo: '[logo of partner / military unit 3]' },
    { name: '[Partner 4 name]', logo: '[logo of partner / military unit 4]' },
    { name: '[Partner 5 name]', logo: '[logo of partner / military unit 5]' },
  ];
}
