import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then(m => m.ServicesPageComponent),
  },
  {
    path: 'services/:slug',
    loadComponent: () => import('./pages/service-detail/service-detail').then(m => m.ServiceDetailPageComponent),
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./pages/portfolio/portfolio').then(m => m.PortfolioPageComponent),
  },
  {
    path: 'portfolio/:slug',
    loadComponent: () => import('./pages/project-detail/project-detail').then(m => m.ProjectDetailPageComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutPageComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactPageComponent),
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog').then(m => m.BlogPageComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-detail/blog-detail').then(m => m.BlogDetailPageComponent),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then(m => m.PrivacyPageComponent),
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms').then(m => m.TermsPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
