import { describe, expect, it } from 'vitest';
import { activeSub, activeTab, buildCrumbs, websitePath } from './studio-nav';

describe('studio nav', () => {
  it('extracts the workspace path', () => {
    expect(websitePath('/studio/website/team/12?x=1')).toBe('team/12');
    expect(websitePath('/studio/dashboard')).toBe('');
  });

  it('finds the active tab and sub-tab', () => {
    const tab = activeTab('/studio/website/projects/categories/new');
    expect(tab?.path).toBe('projects');
    expect(activeSub(tab, '/studio/website/projects/categories/new')?.path).toBe('projects/categories');
    expect(activeSub(tab, '/studio/website/projects/abc')?.path).toBe('projects');
  });

  it('builds breadcrumbs', () => {
    expect(buildCrumbs('/studio/dashboard').map((c) => c.label)).toEqual(['Адмінпанель', 'Дашборд']);
    expect(buildCrumbs('/studio/website/team/new').map((c) => c.label)).toEqual(['Адмінпанель', 'Публічний сайт', 'Команда', 'Створення']);
    expect(buildCrumbs('/studio/website/projects/categories/7').map((c) => c.label)).toEqual([
      'Адмінпанель', 'Публічний сайт', 'Проєкти', 'Категорії', 'Редагування',
    ]);
    expect(buildCrumbs('/studio/website/legal/terms').map((c) => c.label)).toEqual([
      'Адмінпанель', 'Публічний сайт', 'Юридичні сторінки', 'Умови користування',
    ]);
  });
});
