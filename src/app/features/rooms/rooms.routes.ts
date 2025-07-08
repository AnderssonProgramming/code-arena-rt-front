import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ROOMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rooms.component').then(m => m.RoomsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./create-room/create-room.component').then(m => m.CreateRoomComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./room-detail/room-detail.component').then(m => m.RoomDetailComponent),
    canActivate: [authGuard]
  }
];
