import { Routes } from '@angular/router';
import { studioAuthGuard, studioGuestGuard } from '../core/auth/auth.guard';
import { unsavedChangesGuard } from './collection/unsaved-changes.guard';

const list = () => import('./collection/collection-list').then((m) => m.CollectionListComponent);
const form = () => import('./collection/collection-form').then((m) => m.CollectionFormComponent);

/** List at `<path>`, create/edit form at `<path>/:id` (`new` creates). */
const collectionRoutes = (path: string, collection: string): Routes => [
  { path, loadComponent: list, data: { collection } },
  { path: `${path}/:id`, loadComponent: form, data: { collection }, canDeactivate: [unsavedChangesGuard] },
];

/** A singleton document edited in place on a single page. */
const singletonRoute = (path: string, collection: string): Routes => [
  { path, loadComponent: form, data: { collection }, canDeactivate: [unsavedChangesGuard] },
];

/**
 * The hidden back-office ("ERP view"). Not linked from anywhere on the public site and not in
 * the sitemap — reachable only by typing the URL: `/studio`.
 *
 * Map:
 *   /studio/login                      sign in
 *   /studio/dashboard                  overview
 *   /studio/website/<tab>              Public website workspace (media, team, partners, projects,
 *                                      testimonials, services, blog, numbers, coverage, contacts, legal)
 *   /studio/users, /studio/account     operator accounts / own account
 */
export const STUDIO_ROUTES: Routes = [
  {
    path: 'login',
    canMatch: [studioGuestGuard],
    loadComponent: () => import('./login/login').then((m) => m.StudioLoginComponent),
  },
  {
    path: '',
    canMatch: [studioAuthGuard],
    loadComponent: () => import('./shell/studio-shell').then((m) => m.StudioShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.StudioDashboardComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users').then((m) => m.StudioUsersComponent),
      },
      {
        path: 'account',
        loadComponent: () => import('./account/account').then((m) => m.StudioAccountComponent),
      },
      {
        path: 'website',
        loadComponent: () => import('./website/website-workspace').then((m) => m.WebsiteWorkspaceComponent),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'media' },
          ...singletonRoute('media', 'media'),
          ...collectionRoutes('team', 'team'),
          ...collectionRoutes('partners', 'partners'),
          // `projects/categories` must be declared before `projects/:id`.
          ...collectionRoutes('projects/categories', 'project-categories'),
          ...collectionRoutes('projects', 'projects'),
          ...collectionRoutes('testimonials', 'testimonials'),
          ...collectionRoutes('services', 'services'),
          ...collectionRoutes('blog', 'blog'),
          {
            path: 'numbers',
            loadComponent: () => import('./numbers/numbers').then((m) => m.NumbersComponent),
            canDeactivate: [unsavedChangesGuard],
          },
          {
            path: 'coverage',
            loadComponent: () => import('./coverage/coverage').then((m) => m.CoverageComponent),
            data: { collection: 'export-countries' },
          },
          {
            path: 'coverage/regions',
            loadComponent: () => import('./coverage/coverage').then((m) => m.CoverageComponent),
            data: { collection: 'regions' },
          },
          ...singletonRoute('contacts', 'contacts'),
          { path: 'legal', pathMatch: 'full', redirectTo: 'legal/privacy' },
          ...singletonRoute('legal/privacy', 'legal-privacy'),
          ...singletonRoute('legal/terms', 'legal-terms'),
        ],
      },
      // Old flat URLs (/studio/services …) keep working.
      {
        path: ':legacy',
        redirectTo: ({ params }) => `/studio/website/${params['legacy']}`,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
