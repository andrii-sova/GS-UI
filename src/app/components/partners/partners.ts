import { Component, inject } from '@angular/core';
import { ContentStore } from '../../core/content/content.store';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.html',
})
export class PartnersComponent {
  readonly content = inject(ContentStore);
}
