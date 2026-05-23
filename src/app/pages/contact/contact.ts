import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-page',
  imports: [FormsModule],
  templateUrl: './contact.html',
})
export class ContactPageComponent {
  form = {
    name: '',
    company: '',
    phone: '',
    email: '',
    message: '',
    file: null as File | null,
  };

  onSubmit() {
    // [TODO: wire up form submission to backend / email service]
    console.log('Form submitted', this.form);
  }
}
