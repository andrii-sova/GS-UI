import {
  ChangeDetectionStrategy, Component, ElementRef, Injectable, effect, inject, signal, viewChild,
} from '@angular/core';
import { T } from '../studio-i18n';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface Pending extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

/** Promise-based confirm dialog, rendered once by `<app-confirm-host>` using a native `<dialog>`. */
@Injectable({ providedIn: 'root' })
export class StudioConfirm {
  readonly pending = signal<Pending | null>(null);

  ask(options: ConfirmOptions): Promise<boolean> {
    // A new request cancels any open one.
    this.pending()?.resolve(false);
    return new Promise<boolean>((resolve) => this.pending.set({ ...options, resolve }));
  }

  settle(ok: boolean): void {
    const p = this.pending();
    if (!p) return;
    this.pending.set(null);
    p.resolve(ok);
  }
}

@Component({
  selector: 'app-confirm-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg class="st-dialog" aria-labelledby="st-confirm-title" aria-describedby="st-confirm-msg"
            (cancel)="$event.preventDefault(); confirm.settle(false)" (click)="onBackdrop($event)">
      @if (confirm.pending(); as p) {
        <div class="st-dialog-body">
          <h2 id="st-confirm-title" style="margin:0 0 .4rem;font-size:1.1rem;font-weight:700">{{ p.title }}</h2>
          <p id="st-confirm-msg" class="st-muted" style="margin:0;font-size:.9rem">{{ p.message }}</p>
        </div>
        <div class="st-dialog-actions">
          <button type="button" class="st-btn" (click)="confirm.settle(false)">{{ p.cancelLabel ?? t.common.cancel }}</button>
          <button type="button" class="st-btn" [class.st-btn-danger]="p.danger" [class.st-btn-primary]="!p.danger"
                  data-testid="confirm-ok" (click)="confirm.settle(true)">{{ p.confirmLabel ?? t.common.confirm }}</button>
        </div>
      }
    </dialog>
  `,
})
export class ConfirmHostComponent {
  protected readonly confirm = inject(StudioConfirm);
  protected readonly t = T;
  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    effect(() => {
      const open = this.confirm.pending() != null;
      const el = this.dlg().nativeElement;
      if (open && !el.open) el.showModal();
      else if (!open && el.open) el.close();
    });
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dlg().nativeElement) this.confirm.settle(false);
  }
}
