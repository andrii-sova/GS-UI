import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-process',
  templateUrl: './process.html',
})
export class ProcessComponent {
  readonly lang = inject(LangService);
}
