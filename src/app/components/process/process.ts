import { Component, inject } from '@angular/core';
import { LangService } from '../../services/lang.service';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  imports: [RevealDirective],
  selector: 'app-process',
  templateUrl: './process.html',
})
export class ProcessComponent {
  readonly lang = inject(LangService);
}
