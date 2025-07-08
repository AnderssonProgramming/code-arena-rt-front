import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Room, RoomPlayer, GameConfig, RoomStatus } from '../models/interfaces';

export interface CreateRoomRequest {
  name: string;
  description?: string;
  gameConfig: GameConfig;
  isPrivate: boolean;
  password?: string;
}

export interface JoinRoomRequest {
  roomId: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly API_URL = 'http://localhost:8081/api';

  // State management
  private currentRoomSubject = new BehaviorSubject<Room | null>(null);
  public currentRoom$ = this.currentRoomSubject.asObservable();
  
  private availableRoomsSubject = new BehaviorSubject<Room[]>([]);
  public availableRooms$ = this.availableRoomsSubject.asObservable();

  // Signals
  public currentRoom = signal<Room | null>(null);
  public availableRooms = signal<Room[]>([]);
  public isInRoom = signal(false);

  constructor(private http: HttpClient) {}

  // Get all available rooms
  getAvailableRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.API_URL}/rooms/available`)
      .pipe(
        tap(rooms => {
          this.availableRoomsSubject.next(rooms);
          this.availableRooms.set(rooms);
        })
      );
  }

  // Get room by ID
  getRoomById(roomId: string): Observable<Room> {
    return this.http.get<Room>(`${this.API_URL}/rooms/${roomId}`)
      .pipe(
        tap(room => {
          this.currentRoomSubject.next(room);
          this.currentRoom.set(room);
          this.isInRoom.set(true);
        })
      );
  }

  // Create a new room
  createRoom(roomData: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(`${this.API_URL}/rooms`, roomData)
      .pipe(
        tap(room => {
          this.currentRoomSubject.next(room);
          this.currentRoom.set(room);
          this.isInRoom.set(true);
        })
      );
  }

  // Join a room
  joinRoom(request: JoinRoomRequest): Observable<Room> {
    return this.http.post<Room>(`${this.API_URL}/rooms/${request.roomId}/join`, {
      password: request.password
    }).pipe(
      tap(room => {
        this.currentRoomSubject.next(room);
        this.currentRoom.set(room);
        this.isInRoom.set(true);
      })
    );
  }

  // Leave current room
  leaveRoom(roomId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/rooms/${roomId}/leave`, {})
      .pipe(
        tap(() => {
          this.currentRoomSubject.next(null);
          this.currentRoom.set(null);
          this.isInRoom.set(false);
        })
      );
  }

  // Update room settings (host only)
  updateRoomSettings(roomId: string, gameConfig: GameConfig): Observable<Room> {
    return this.http.put<Room>(`${this.API_URL}/rooms/${roomId}/settings`, gameConfig)
      .pipe(
        tap(room => {
          this.currentRoomSubject.next(room);
          this.currentRoom.set(room);
        })
      );
  }

  // Start game (host only)
  startGame(roomId: string): Observable<{ gameId: string }> {
    return this.http.post<{ gameId: string }>(`${this.API_URL}/rooms/${roomId}/start`, {});
  }

  // Toggle ready status
  toggleReady(roomId: string): Observable<Room> {
    return this.http.post<Room>(`${this.API_URL}/rooms/${roomId}/ready`, {})
      .pipe(
        tap(room => {
          this.currentRoomSubject.next(room);
          this.currentRoom.set(room);
        })
      );
  }

  // Get user's current room
  getCurrentRoom(): Observable<Room | null> {
    return this.http.get<Room | null>(`${this.API_URL}/rooms/current`)
      .pipe(
        tap(room => {
          this.currentRoomSubject.next(room);
          this.currentRoom.set(room);
          this.isInRoom.set(!!room);
        })
      );
  }

  // Utility methods
  isHost(room: Room, userId: string): boolean {
    return room.hostId === userId;
  }

  canStartGame(room: Room): boolean {
    return room.players.length >= 2 && 
           room.players.every(player => player.isReady) &&
           room.status === RoomStatus.WAITING;
  }

  getPlayerById(room: Room, userId: string): RoomPlayer | undefined {
    return room.players.find(player => player.userId === userId);
  }

  // Search rooms
  searchRooms(query: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.API_URL}/rooms/search?q=${encodeURIComponent(query)}`)
      .pipe(
        tap(rooms => {
          this.availableRoomsSubject.next(rooms);
          this.availableRooms.set(rooms);
        })
      );
  }

  // Get rooms by difficulty
  getRoomsByDifficulty(difficulty: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.API_URL}/rooms/difficulty/${difficulty}`)
      .pipe(
        tap(rooms => {
          this.availableRoomsSubject.next(rooms);
          this.availableRooms.set(rooms);
        })
      );
  }

  // Clear current room state
  clearCurrentRoom(): void {
    this.currentRoomSubject.next(null);
    this.currentRoom.set(null);
    this.isInRoom.set(false);
  }
}
