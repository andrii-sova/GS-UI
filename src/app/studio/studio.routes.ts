import { Routes } from '@angular/router';
import { studioAuthGuard, studioGuestGuard } from '../core/auth/auth.guard';
import { unsavedChangesGuard } from './collection/unsaved-changes.guard';

/**
 * The hidden content studio. Not linked from anywhere on the public site and not in the
 * sitemap — reachable only by typing the URL: `/studio`.
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
        path: ':collection',
        loadComponent: () => import('./collection/collection-list').then((m) => m.CollectionListComponent),
      },
      {
        path: ':collection/:id',
        loadComponent: () => import('./collection/collection-form').then((m) => m.CollectionFormComponent),
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
