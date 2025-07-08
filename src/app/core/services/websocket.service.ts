import { Injectable, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { 
  WebSocketMessage, 
  RoomJoinMessage, 
  RoomLeaveMessage, 
  ChatMessage, 
  GameStartMessage, 
  GameAnswerMessage, 
  PlayerReadyMessage 
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private readonly WS_URL = 'ws://localhost:8081/ws';
  
  // Connection status
  public isConnected = signal(false);
  private connectionSubject = new BehaviorSubject<boolean>(false);
  public connection$ = this.connectionSubject.asObservable();

  // Message streams
  private roomMessagesSubject = new BehaviorSubject<any>(null);
  public roomMessages$ = this.roomMessagesSubject.asObservable();

  private gameMessagesSubject = new BehaviorSubject<any>(null);
  public gameMessages$ = this.gameMessagesSubject.asObservable();

  private chatMessagesSubject = new BehaviorSubject<ChatMessage | null>(null);
  public chatMessages$ = this.chatMessagesSubject.asObservable();

  constructor(private authService: AuthService) {
    this.initializeWebSocket();
  }

  private initializeWebSocket(): void {
    this.client = new Client({
      brokerURL: this.WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${this.authService.getToken()}`
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected.set(true);
        this.connectionSubject.next(true);
        this.subscribeToTopics();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected.set(false);
        this.connectionSubject.next(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });
  }

  connect(): void {
    if (!this.client.active) {
      // Update headers with current token
      this.client.configure({
        connectHeaders: {
          Authorization: `Bearer ${this.authService.getToken()}`
        }
      });
      this.client.activate();
    }
  }

  disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  private subscribeToTopics(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;

    // Subscribe to user-specific messages
    this.client.subscribe(`/user/${userId}/queue/messages`, (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.handleUserMessage(data);
    });

    // Subscribe to room updates
    this.client.subscribe('/topic/rooms', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.roomMessagesSubject.next(data);
    });

    // Subscribe to game updates
    this.client.subscribe('/topic/games', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.gameMessagesSubject.next(data);
    });
  }

  private handleUserMessage(data: any): void {
    switch (data.type) {
      case 'ROOM_UPDATE':
        this.roomMessagesSubject.next(data);
        break;
      case 'GAME_UPDATE':
        this.gameMessagesSubject.next(data);
        break;
      case 'CHAT_MESSAGE':
        this.chatMessagesSubject.next(data.payload);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Room WebSocket methods
  joinRoom(message: RoomJoinMessage): void {
    this.sendMessage('/app/room.join', message);
  }

  leaveRoom(message: RoomLeaveMessage): void {
    this.sendMessage('/app/room.leave', message);
  }

  toggleReady(message: PlayerReadyMessage): void {
    this.sendMessage('/app/room.ready', message);
  }

  sendChatMessage(message: ChatMessage): void {
    this.sendMessage('/app/room.chat', message);
  }

  // Game WebSocket methods
  startGame(message: GameStartMessage): void {
    this.sendMessage('/app/game.start', message);
  }

  submitAnswer(message: GameAnswerMessage): void {
    this.sendMessage('/app/game.answer', message);
  }

  // Subscribe to specific room
  subscribeToRoom(roomId: string): void {
    this.client.subscribe(`/topic/room/${roomId}`, (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.roomMessagesSubject.next(data);
    });
  }

  // Subscribe to specific game
  subscribeToGame(gameId: string): void {
    this.client.subscribe(`/topic/game/${gameId}`, (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.gameMessagesSubject.next(data);
    });
  }

  private sendMessage(destination: string, body: any): void {
    if (this.client.active) {
      this.client.publish({
        destination,
        body: JSON.stringify(body)
      });
    } else {
      console.error('WebSocket not connected');
    }
  }

  // Utility methods
  clearMessages(): void {
    this.roomMessagesSubject.next(null);
    this.gameMessagesSubject.next(null);
    this.chatMessagesSubject.next(null);
  }
}
