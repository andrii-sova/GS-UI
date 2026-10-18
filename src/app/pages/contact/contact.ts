import { Component, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ContentStore } from '../../core/content/content.store';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-contact-page',
  imports: [FormsModule],
  templateUrl: './contact.html',
})
export class ContactPageComponent {
  readonly lang = inject(LangService);
  readonly content = inject(ContentStore);

  private readonly sanitizer = inject(DomSanitizer);

  /** Trusted map embed URL built from the API coordinates (null until configured). */
  readonly mapSrc = computed(() => {
    const url = this.content.mapEmbedUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

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

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.form.file = input.files?.[0] ?? null;
  }
}
