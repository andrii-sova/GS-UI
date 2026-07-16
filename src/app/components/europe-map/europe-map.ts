import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-europe-map',
  templateUrl: './europe-map.html',
})
export class EuropeMapComponent {
  readonly lang = inject(LangService);

  regionName(id: string): string {
    return this.lang.dict().europeMap.items.find((r) => r.id === id)?.name ?? '';
  }
}
