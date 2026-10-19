import { Routes } from '@angular/router';

// Clientes y Galería son públicas (solo lectura).
// El login se pide al insertar, editar o borrar (ver HomePage.requireLogin).
export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'clientes',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'galeria',
        loadComponent: () => import('./galeria/galeria.page').then((m) => m.GaleriaPage),
      },
      { path: '', redirectTo: 'clientes', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'tabs/clientes', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/clientes' },
];
