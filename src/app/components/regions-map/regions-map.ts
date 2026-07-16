import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-regions-map',
  templateUrl: './regions-map.html',
})
export class RegionsMapComponent {
  readonly lang = inject(LangService);

  regionName(id: string): string {
    return this.lang.dict().regionsMap.items.find((r) => r.id === id)?.name ?? '';
  }
}
