import { T } from './studio-i18n';

/** Navigation model of the back-office: modules, the Public website tabs and breadcrumbs. */

export interface SubTab { label: string; path: string }
export interface WebsiteTab { path: string; label: string; icon: string; sub?: SubTab[] }
export interface Crumb { label: string; link?: string }

export const WEBSITE_BASE = '/studio/website';

export const WEBSITE_TABS: WebsiteTab[] = [
  { path: 'media', label: 'Медіа та головний екран', icon: '🖼️' },
  { path: 'team', label: 'Команда', icon: '👤' },
  { path: 'partners', label: 'Партнери', icon: '🤝' },
  {
    path: 'projects', label: 'Проєкти', icon: '🏗️',
    sub: [{ label: 'Проєкти', path: 'projects' }, { label: 'Категорії', path: 'projects/categories' }],
  },
  { path: 'testimonials', label: 'Відгуки', icon: '💬' },
  { path: 'services', label: 'Послуги', icon: '🔧' },
  { path: 'blog', label: 'Блог', icon: '📝' },
  { path: 'numbers', label: 'Показники', icon: '🔢' },
  {
    path: 'coverage', label: 'Географія', icon: '🗺️',
    sub: [{ label: 'Країни експорту', path: 'coverage' }, { label: 'Регіони', path: 'coverage/regions' }],
  },
  { path: 'contacts', label: 'Контакти та соцмережі', icon: '📞' },
  {
    path: 'legal', label: 'Юридичні сторінки', icon: '⚖️',
    sub: [{ label: 'Політика конфіденційності', path: 'legal/privacy' }, { label: 'Умови користування', path: 'legal/terms' }],
  },
];

const MODULE_LABELS: Record<string, string> = {
  dashboard: T.shell.nav.dashboard,
  users: T.shell.nav.users,
  account: T.shell.nav.account,
  website: T.shell.nav.website,
};

/** Path below /studio/website of a URL, without query/hash; '' when not in the workspace. */
export function websitePath(url: string): string {
  const clean = url.split(/[?#]/)[0];
  const prefix = WEBSITE_BASE + '/';
  return clean.startsWith(prefix) ? clean.slice(prefix.length).replace(/\/+$/, '') : '';
}

export function activeTab(url: string): WebsiteTab | undefined {
  const first = websitePath(url).split('/')[0];
  return WEBSITE_TABS.find((t) => t.path === first);
}

/** Sub-tab whose path is the longest prefix of the current workspace path. */
export function activeSub(tab: WebsiteTab | undefined, url: string): SubTab | undefined {
  if (!tab?.sub) return undefined;
  const rel = websitePath(url);
  return [...tab.sub]
    .sort((a, b) => b.path.length - a.path.length)
    .find((s) => rel === s.path || rel.startsWith(s.path + '/'));
}

export function buildCrumbs(url: string): Crumb[] {
  const segs = url.split(/[?#]/)[0].split('/').filter(Boolean);
  if (segs[0] !== 'studio') return [];
  const rest = segs.slice(1);
  const crumbs: Crumb[] = [{ label: T.shell.sidebarBrand, link: '/studio/dashboard' }];
  if (rest.length === 0) return crumbs;

  const module = rest[0];
  const moduleLabel = MODULE_LABELS[module] ?? module;
  if (module !== 'website') {
    crumbs.push({ label: moduleLabel });
    return crumbs;
  }

  crumbs.push({ label: moduleLabel, link: rest.length > 1 ? `${WEBSITE_BASE}/media` : undefined });
  const tab = activeTab(url);
  if (!tab) return crumbs;

  const sub = activeSub(tab, url);
  const subDepth = sub ? sub.path.split('/').length : 1;
  const tail = websitePath(url).split('/').slice(subDepth);

  crumbs.push({ label: tab.label, link: sub || tail.length ? `${WEBSITE_BASE}/${tab.sub?.[0].path ?? tab.path}` : undefined });
  if (sub && sub.path !== tab.sub?.[0].path) {
    crumbs.push({ label: sub.label, link: tail.length ? `${WEBSITE_BASE}/${sub.path}` : undefined });
  }
  if (tail.length) crumbs.push({ label: tail[0] === 'new' ? 'Створення' : 'Редагування' });
  return crumbs;
}
