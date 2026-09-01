import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Protects every studio route except the login page. */
export const studioAuthGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.restoreSession();
  return auth.isAuthenticated() ? true : router.createUrlTree(['/studio/login']);
};

/** Keeps a signed-in operator away from the login page. */
export const studioGuestGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.restoreSession();
  return auth.isAuthenticated() ? router.createUrlTree(['/studio']) : true;
};
