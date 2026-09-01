import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { API_BASE } from '../api';
import { AuthService } from './auth.service';

const AUTH_ENDPOINTS = [`${API_BASE}/auth/login`, `${API_BASE}/auth/refresh`, `${API_BASE}/auth/logout`];

/**
 * - Sends the refresh cookie with every same-origin API call (`withCredentials`).
 * - Attaches the in-memory access token to protected calls.
 * - On a 401 from a protected call, tries a single silent refresh, then replays the request.
 */
export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  if (!req.url.startsWith(API_BASE)) return next(req);

  const auth = inject(AuthService);
  const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => req.url.startsWith(url));

  let request = req.clone({ withCredentials: true });
  const token = auth.accessToken;
  if (token && !isAuthEndpoint) {
    request = request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(request).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthEndpoint &&
        !req.headers.has('X-Retry')
      ) {
        return from(auth.refresh()).pipe(
          switchMap((ok) => {
            if (!ok) return throwError(() => error);
            const retried = req.clone({
              withCredentials: true,
              setHeaders: {
                Authorization: `Bearer ${auth.accessToken}`,
                'X-Retry': '1',
              },
            });
            return next(retried);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
}
