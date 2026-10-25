import { environment } from '../../environments/environment';

/**
 * Base path for the GS API.
 *  - dev: relative `/api`, forwarded to the API on :5048 by `proxy.conf.json`;
 *  - production: absolute URL from `environments/environment.production.ts`.
 */
export const API_BASE = `${environment.apiUrl}/api`;

export const apiUrl = (path: string): string =>
  `${API_BASE}/${path.replace(/^\/+/, '')}`;
