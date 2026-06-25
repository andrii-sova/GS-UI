import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-contact-page',
  imports: [FormsModule],
  templateUrl: './contact.html',
})
export class ContactPageComponent {
  readonly lang = inject(LangService);

  form = {
    name: '',
    company: '',
    phone: '',
    email: '',
    message: '',
    file: null as File | null,
  };

  onSubmit() {
    console.log('Form submitted', this.form);
  }
}
