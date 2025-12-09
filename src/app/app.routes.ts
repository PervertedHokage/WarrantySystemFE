import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: async () => {
      const c = await import(
        './components/landing-page/landing-page.component'
      );
      return c.LandingPageComponent;
    },
  },
  {
    path: 'login',
    loadComponent: async () => {
      const c = await import('./components/login/login.component');
      return c.LoginComponent;
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/_shared/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      ),
  },
];
