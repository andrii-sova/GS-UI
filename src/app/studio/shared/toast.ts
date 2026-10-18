import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { T } from '../studio-i18n';

export type ToastKind = 'success' | 'error' | 'warn';

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class StudioToast {
  private nextId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(message: string, kind: ToastKind = 'success', ms = kind === 'success' ? 3500 : 7000): void {
    const id = this.nextId++;
    this._toasts.update((t) => [...t, { id, kind, message }]);
    setTimeout(() => this.dismiss(id), ms);
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  warn(message: string): void { this.show(message, 'warn'); }

  dismiss(id: number): void {
    this._toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

@Component({
  selector: 'app-toast-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="st-toasts" role="region" [attr.aria-label]="i18n.common.notifications">
      @for (t of toast.toasts(); track t.id) {
        <div class="st-toast" [class]="'st-toast ' + t.kind" [attr.role]="t.kind === 'error' ? 'alert' : 'status'">
          <span style="flex:1">{{ t.message }}</span>
          <button type="button" [attr.aria-label]="i18n.common.dismiss" (click)="toast.dismiss(t.id)">✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toast = inject(StudioToast);
  protected readonly i18n = T;
}
