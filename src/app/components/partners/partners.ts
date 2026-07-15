import { Component } from '@angular/core';
import { PARTNERS_MANIFEST } from './partners-manifest';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.html',
})
export class PartnersComponent {
  partners = PARTNERS_MANIFEST;
}
