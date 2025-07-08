import { Routes } from '@angular/router';

export const GAME_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./game.component').then(m => m.GameComponent)
  }
];
