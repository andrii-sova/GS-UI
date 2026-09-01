/**
 * Base path for the GS content API.
 *
 * Both dev and prod use a relative `/api` path:
 *  - dev: `proxy.conf.json` forwards `/api` (and `/uploads`) to the API on :5048;
 *  - prod: the site and API are served behind the same host / reverse proxy.
 */
export const API_BASE = '/api';

export const apiUrl = (path: string): string =>
  `${API_BASE}/${path.replace(/^\/+/, '')}`;
