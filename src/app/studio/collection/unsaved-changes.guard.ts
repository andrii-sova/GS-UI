import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  /** Returns true if it is safe to leave (no changes, or the user confirmed discarding them). */
  canLeave(): boolean;
}

/** Warns before navigating away from a form with unsaved edits. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  component.canLeave();
