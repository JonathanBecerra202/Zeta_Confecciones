import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'clientes',
        loadComponent: () => import('./pages/clientes/clientes').then(m => m.Clientes)
      },
      {
        path: 'organizaciones',
        loadComponent: () => import('./pages/organizaciones/organizaciones').then(m => m.Organizaciones)
      },
      {
        path: 'dependencias',
        loadComponent: () => import('./pages/dependencias/dependencias').then(m => m.Dependencias)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./pages/pedidos/pedidos').then(m => m.Pedidos)
      },
      {
        path: 'auditorias',
        loadComponent: () => import('./pages/auditorias/auditorias').then(m => m.Auditorias),
        canActivate: [adminGuard]
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];