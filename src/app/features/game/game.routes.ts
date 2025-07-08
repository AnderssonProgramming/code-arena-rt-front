import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const GAME_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./game.component').then(m => m.GameComponent),
    canActivate: [authGuard]
  }
];
