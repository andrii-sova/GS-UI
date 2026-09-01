import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from '../api';
import { AuthResponse, LoginCredentials, StudioUser } from './auth.types';

/**
 * Studio session state. The access token lives only in memory (never localStorage); the
 * refresh token is an HttpOnly cookie the browser sends to `/api/auth/*` automatically.
 * On a full page load `restoreSession()` silently exchanges the cookie for a new access token.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<StudioUser | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _initialised = signal(false);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() != null && this._accessToken() != null);
  readonly initialised = this._initialised.asReadonly();

  private restoring: Promise<boolean> | null = null;

  get accessToken(): string | null {
    return this._accessToken();
  }

  async login(credentials: LoginCredentials): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(apiUrl('auth/login'), credentials),
    );
    this.apply(res);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(apiUrl('auth/logout'), {}));
    } finally {
      this._user.set(null);
      this._accessToken.set(null);
    }
  }

  /** Exchange the refresh cookie for a fresh access token. Returns false when not signed in. */
  async refresh(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(apiUrl('auth/refresh'), {}),
      );
      this.apply(res);
      return true;
    } catch {
      this._user.set(null);
      this._accessToken.set(null);
      return false;
    }
  }

  /** Called once on app start (and idempotent afterwards). */
  restoreSession(): Promise<boolean> {
    if (this._initialised()) return Promise.resolve(this.isAuthenticated());
    this.restoring ??= this.refresh().finally(() => {
      this._initialised.set(true);
      this.restoring = null;
    });
    return this.restoring;
  }

  private apply(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    this._user.set(res.user);
  }
}
