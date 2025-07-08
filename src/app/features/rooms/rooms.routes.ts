import { Routes } from '@angular/router';

export const ROOMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./rooms.component').then(m => m.RoomsComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('./create-room/create-room.component').then(m => m.CreateRoomComponent)
  }
];
