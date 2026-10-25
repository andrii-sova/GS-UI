import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ContentStore } from '../../core/content/content.store';
import { RevealDirective } from '../../shared/reveal.directive';
import { LangService } from '../../services/lang.service';

@Component({
  selector: 'app-contact-page',
  imports: [FormsModule, RevealDirective],
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

  readonly status = signal<'idle' | 'sending' | 'success' | 'error'>('idle');
  readonly submitted = signal(false);
  readonly mapLoaded = signal(false);

  /** Feedback strings (not in the shared dictionary yet). */
  readonly t = computed(() =>
    this.lang.lang() === 'uk'
      ? {
          required: "Це поле обов'язкове",
          invalidEmail: 'Вкажіть коректну адресу email',
          sending: 'Надсилаємо…',
          success: "Дякуємо! Ми отримали ваше повідомлення та зв'яжемося з вами найближчим часом.",
          error: 'Не вдалося надіслати повідомлення. Спробуйте ще раз або зателефонуйте нам.',
        }
      : {
          required: 'This field is required',
          invalidEmail: 'Enter a valid email address',
          sending: 'Sending…',
          success: 'Thank you! We received your message and will get back to you shortly.',
          error: 'Could not send your message. Please try again or call us.',
        },
  );

  showError(field: 'name' | 'phone' | 'email' | 'message'): boolean {
    if (!this.submitted()) return false;
    const v = this.form[field].trim();
    return field === 'email' ? v !== '' && !/^\S+@\S+\.\S+$/.test(v) : v === '';
  }

  private isValid(): boolean {
    return !(['name', 'phone', 'email', 'message'] as const).some((f) => this.showError(f));
  }

  async onSubmit(): Promise<void> {
    if (this.status() === 'sending') return;
    this.submitted.set(true);
    if (!this.isValid()) return;
    this.status.set('sending');
    try {
      await this.send();
      this.status.set('success');
      this.form = { name: '', company: '', phone: '', email: '', message: '', file: null };
      this.submitted.set(false);
    } catch {
      this.status.set('error');
    }
  }

  /** Placeholder transport: there is no backend endpoint yet. Replace with a real request that rejects on failure. */
  private send(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 900));
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.form.file = input.files?.[0] ?? null;
  }
}
