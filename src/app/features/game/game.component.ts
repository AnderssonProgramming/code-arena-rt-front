import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { RoomService } from '../../../core/services/room.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Room, User, GameSession } from '../../../core/models/interfaces';
import { SudokuGameComponent } from './games/sudoku/sudoku-game.component';
import { CrosswordGameComponent } from './games/crossword/crossword-game.component';
import { WordSearchGameComponent } from './games/word-search/word-search-game.component';
import { CodeChallengeGameComponent } from './games/code-challenge/code-challenge-game.component';
import { MathPuzzleGameComponent } from './games/math-puzzle/math-puzzle-game.component';

@Component({
  selector: 'app-game',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    SudokuGameComponent,
    CrosswordGameComponent,
    WordSearchGameComponent,
    CodeChallengeGameComponent,
    MathPuzzleGameComponent
  ],
  template: `
    <div class="game-container" *ngIf="room()">
      <!-- Game Header -->
      <div class="game-header">
        <div class="room-info">
          <h1>{{room()?.name}}</h1>
          <div class="game-details">
            <mat-chip class="game-type-chip">
              <mat-icon>{{getGameIcon(room()?.gameConfig.gameType)}}</mat-icon>
              {{getGameDisplayName(room()?.gameConfig.gameType)}}
            </mat-chip>
            <mat-chip [class]="'difficulty-' + room()?.gameConfig.difficulty.toLowerCase()">
              {{room()?.gameConfig.difficulty}}
            </mat-chip>
          </div>
        </div>
        
        <div class="game-actions">
          <button mat-icon-button (click)="leaveRoom()" matTooltip="Leave Room">
            <mat-icon>exit_to_app</mat-icon>
          </button>
        </div>
      </div>

      <!-- Game Status -->
      <div class="game-status">
        @if (room()?.status === 'WAITING') {
          <mat-card class="status-card waiting">
            <mat-card-content>
              <div class="status-content">
                <mat-icon class="status-icon">hourglass_empty</mat-icon>
                <h3>Waiting for Players</h3>
                <p>{{room()?.currentPlayers.length}}/{{room()?.maxPlayers}} players joined</p>
                
                @if (isRoomOwner()) {
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="startGame()"
                    [disabled]="!canStartGame()">
                    <mat-icon>play_arrow</mat-icon>
                    Start Game
                  </button>
                } @else {
                  <p class="waiting-message">Waiting for room owner to start the game...</p>
                }
              </div>
            </mat-card-content>
          </mat-card>
        } @else if (room()?.status === 'IN_PROGRESS') {
          <div class="game-progress">
            <!-- Game Timer -->
            <mat-card class="timer-card">
              <mat-card-content>
                <div class="timer-content">
                  <mat-icon class="timer-icon">schedule</mat-icon>
                  <div class="timer-display">
                    <span class="time">{{formatTime(timeRemaining())}}</span>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="getTimePercentage()"
                      class="timer-progress">
                    </mat-progress-bar>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Game Area -->
            <div class="game-area">
              @switch (room()?.gameConfig.gameType) {
                @case ('SUDOKU') {
                  <app-sudoku-game [gameSession]="currentGameSession()"></app-sudoku-game>
                }
                @case ('CROSSWORD') {
                  <app-crossword-game [gameSession]="currentGameSession()"></app-crossword-game>
                }
                @case ('WORD_SEARCH') {
                  <app-word-search-game [gameSession]="currentGameSession()"></app-word-search-game>
                }
                @case ('CODE_CHALLENGE') {
                  <app-code-challenge-game [gameSession]="currentGameSession()"></app-code-challenge-game>
                }
                @case ('MATH_PUZZLE') {
                  <app-math-puzzle-game [gameSession]="currentGameSession()"></app-math-puzzle-game>
                }
                @default {
                  <div class="game-placeholder">
                    <mat-icon class="placeholder-icon">games</mat-icon>
                    <h3>Game Loading...</h3>
                    <p>Preparing {{getGameDisplayName(room()?.gameConfig.gameType)}} game</p>
                  </div>
                }
              }
            </div>
          </div>
        } @else if (room()?.status === 'FINISHED') {
          <mat-card class="status-card finished">
            <mat-card-content>
              <div class="status-content">
                <mat-icon class="status-icon">flag</mat-icon>
                <h3>Game Finished!</h3>
                <div class="results">
                  <!-- Game results will be shown here -->
                  <p>Check the scoreboard for final results</p>
                </div>
                <div class="finished-actions">
                  <button mat-raised-button routerLink="/rooms">
                    <mat-icon>meeting_room</mat-icon>
                    Browse Rooms
                  </button>
                  <button mat-raised-button color="primary" (click)="playAgain()">
                    <mat-icon>replay</mat-icon>
                    Play Again
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Players Panel -->
      <div class="players-panel">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Players ({{room()?.currentPlayers.length}}/{{room()?.maxPlayers}})</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="players-list">
              @for (player of room()?.currentPlayers; track player.id) {
                <div class="player-item" [class.current-user]="player.id === currentUser()?.id">
                  <div class="player-info">
                    <div class="player-avatar">
                      @if (player.avatar) {
                        <img [src]="player.avatar" [alt]="player.username">
                      } @else {
                        <mat-icon>person</mat-icon>
                      }
                    </div>
                    <div class="player-details">
                      <span class="player-name">{{player.username}}</span>
                      @if (player.id === room()?.ownerId) {
                        <mat-chip class="owner-chip">
                          <mat-icon>star</mat-icon>
                          Host
                        </mat-chip>
                      }
                    </div>
                  </div>
                  
                  @if (room()?.status === 'IN_PROGRESS') {
                    <div class="player-score">
                      <span class="score">{{getPlayerScore(player.id)}}</span>
                    </div>
                  } @else {
                    <div class="player-status">
                      @if (isPlayerReady(player.id)) {
                        <mat-chip class="ready-chip">
                          <mat-icon>check</mat-icon>
                          Ready
                        </mat-chip>
                      } @else {
                        <mat-chip class="waiting-chip">
                          <mat-icon>schedule</mat-icon>
                          Waiting
                        </mat-chip>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Chat Panel -->
      <div class="chat-panel">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Chat</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="chat-messages" #chatContainer>
              @for (message of chatMessages(); track message.id) {
                <div class="chat-message" [class.own-message]="message.senderId === currentUser()?.id">
                  <div class="message-content">
                    <span class="sender">{{message.senderName}}</span>
                    <span class="text">{{message.message}}</span>
                    <span class="time">{{formatMessageTime(message.timestamp)}}</span>
                  </div>
                </div>
              }
            </div>
            <div class="chat-input">
              <mat-form-field appearance="outline" class="full-width">
                <input 
                  matInput 
                  [(ngModel)]="chatMessage" 
                  placeholder="Type a message..."
                  (keyup.enter)="sendChatMessage()"
                  maxlength="200">
                <button 
                  mat-icon-button 
                  matSuffix 
                  (click)="sendChatMessage()"
                  [disabled]="!chatMessage.trim()">
                  <mat-icon>send</mat-icon>
                </button>
              </mat-form-field>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="!room() && isLoading()">
      <mat-spinner></mat-spinner>
      <p>Loading game room...</p>
    </div>
  `,
  styles: [`
    .game-container {
      display: grid;
      grid-template-columns: 1fr 300px;
      grid-template-rows: auto 1fr auto;
      grid-template-areas: 
        "header header"
        "game players"
        "game chat";
      gap: 1rem;
      padding: 1rem;
      height: 100vh;
      max-height: 100vh;
      overflow: hidden;
    }

    .game-header {
      grid-area: header;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;

      h1 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-weight: 700;
      }

      .game-details {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .game-type-chip {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        
        mat-icon {
          color: white;
        }
      }
    }

    .game-status, .game-progress {
      grid-area: game;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .status-card {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      &.waiting {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      }

      &.finished {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      }

      .status-content {
        text-align: center;

        .status-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          color: #6b7280;
        }

        h3 {
          margin-bottom: 1rem;
          color: #1f2937;
        }

        .waiting-message {
          color: #6b7280;
          font-style: italic;
        }
      }
    }

    .timer-card {
      margin-bottom: 1rem;

      .timer-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .timer-icon {
          font-size: 2rem;
          color: #ef4444;
        }

        .timer-display {
          flex: 1;

          .time {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
          }

          .timer-progress {
            margin-top: 0.5rem;
            height: 6px;
          }
        }
      }
    }

    .game-area {
      flex: 1;
      overflow: auto;
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;

      .game-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #6b7280;

        .placeholder-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      }
    }

    .players-panel {
      grid-area: players;

      .players-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-height: 300px;
        overflow-y: auto;
      }

      .player-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        border-radius: 8px;
        background: #f9fafb;

        &.current-user {
          background: #dbeafe;
          border: 1px solid #3b82f6;
        }

        .player-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .player-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            mat-icon {
              font-size: 1.2rem;
              color: #6b7280;
            }
          }

          .player-details {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .player-name {
              font-weight: 600;
              font-size: 0.875rem;
            }

            .owner-chip {
              background: #fbbf24;
              color: #1f2937;
              font-size: 0.75rem;
              height: 20px;

              mat-icon {
                font-size: 0.875rem;
              }
            }
          }
        }

        .player-score {
          .score {
            font-weight: 700;
            font-size: 1.1rem;
            color: #1f2937;
          }
        }

        .ready-chip {
          background: #d1fae5;
          color: #059669;
          font-size: 0.75rem;
        }

        .waiting-chip {
          background: #fef3c7;
          color: #d97706;
          font-size: 0.75rem;
        }
      }
    }

    .chat-panel {
      grid-area: chat;

      .chat-messages {
        height: 200px;
        overflow-y: auto;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: #f9fafb;
        border-radius: 8px;

        .chat-message {
          margin-bottom: 0.75rem;

          &.own-message .message-content {
            background: #3b82f6;
            color: white;
            margin-left: auto;
          }

          .message-content {
            background: white;
            padding: 0.5rem 0.75rem;
            border-radius: 12px;
            max-width: 80%;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

            .sender {
              font-weight: 600;
              font-size: 0.75rem;
              display: block;
              margin-bottom: 0.25rem;
            }

            .text {
              display: block;
              margin-bottom: 0.25rem;
            }

            .time {
              font-size: 0.625rem;
              opacity: 0.7;
            }
          }
        }
      }

      .chat-input {
        .full-width {
          width: 100%;
        }
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;

      p {
        margin-top: 1rem;
        color: #6b7280;
      }
    }

    // Difficulty color variants
    .difficulty-easy { background: #d1fae5; color: #059669; }
    .difficulty-medium { background: #fef3c7; color: #d97706; }
    .difficulty-hard { background: #fee2e2; color: #dc2626; }

    @media (max-width: 768px) {
      .game-container {
        grid-template-columns: 1fr;
        grid-template-areas: 
          "header"
          "game"
          "players"
          "chat";
        height: auto;
        max-height: none;
      }

      .players-panel, .chat-panel {
        .players-list, .chat-messages {
          max-height: 150px;
        }
      }
    }
  `]
})
export class GameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);
  private wsService = inject(WebSocketService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Reactive signals
  room = signal<Room | null>(null);
  currentGameSession = signal<GameSession | null>(null);
  isLoading = signal(true);
  timeRemaining = signal(0);
  chatMessages = signal<any[]>([]);
  chatMessage = '';

  // Component state
  currentUser = this.authService.currentUser;
  private subscriptions: Subscription[] = [];
  private gameTimer?: number;
  private roomId = '';

  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    if (this.roomId) {
      this.loadRoom();
      this.setupWebSocketSubscriptions();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    this.wsService.leaveRoom(this.roomId);
  }

  private loadRoom(): void {
    this.roomService.getRoomById(this.roomId).subscribe({
      next: (room) => {
        this.room.set(room);
        this.isLoading.set(false);
        
        // Join WebSocket room
        this.wsService.joinRoom(this.roomId);
        
        // Start timer if game is in progress
        if (room.status === 'IN_PROGRESS') {
          this.startGameTimer();
        }
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.snackBar.open('Failed to load game room', 'Close', { duration: 3000 });
        this.router.navigate(['/rooms']);
      }
    });
  }

  private setupWebSocketSubscriptions(): void {
    // Room updates
    const roomSub = this.wsService.roomMessages$.subscribe(message => {
      if (message) {
        this.handleRoomMessage(message);
      }
    });

    // Game updates
    const gameSub = this.wsService.gameMessages$.subscribe(message => {
      if (message) {
        this.handleGameMessage(message);
      }
    });

    // Chat messages
    const chatSub = this.wsService.chatMessages$.subscribe(message => {
      if (message) {
        this.chatMessages.update(messages => [...messages, message]);
      }
    });

    this.subscriptions.push(roomSub, gameSub, chatSub);
  }

  private handleRoomMessage(message: any): void {
    switch (message.type) {
      case 'PLAYER_JOINED':
      case 'PLAYER_LEFT':
        this.loadRoom(); // Refresh room data
        break;
      case 'GAME_STARTED':
        this.room.update(room => room ? { ...room, status: 'IN_PROGRESS' } : null);
        this.startGameTimer();
        break;
      case 'GAME_ENDED':
        this.room.update(room => room ? { ...room, status: 'FINISHED' } : null);
        this.stopGameTimer();
        break;
    }
  }

  private handleGameMessage(message: any): void {
    // Handle game-specific messages (moves, scores, etc.)
    console.log('Game message:', message);
  }

  private startGameTimer(): void {
    const room = this.room();
    if (!room) return;

    this.timeRemaining.set(room.gameConfig.timeLimit);
    
    this.gameTimer = setInterval(() => {
      this.timeRemaining.update(time => {
        if (time <= 1) {
          this.stopGameTimer();
          return 0;
        }
        return time - 1;
      });
    }, 1000) as any;
  }

  private stopGameTimer(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = undefined;
    }
  }

  isRoomOwner(): boolean {
    const room = this.room();
    const user = this.currentUser();
    return room?.ownerId === user?.id;
  }

  canStartGame(): boolean {
    const room = this.room();
    return room ? room.currentPlayers.length >= 2 : false;
  }

  startGame(): void {
    if (!this.canStartGame()) return;

    this.roomService.startGame(this.roomId).subscribe({
      next: () => {
        // Game started, timer will be started by WebSocket message
      },
      error: (error) => {
        console.error('Error starting game:', error);
        this.snackBar.open('Failed to start game', 'Close', { duration: 3000 });
      }
    });
  }

  leaveRoom(): void {
    this.roomService.leaveRoom(this.roomId).subscribe({
      next: () => {
        this.router.navigate(['/rooms']);
      },
      error: (error) => {
        console.error('Error leaving room:', error);
        this.router.navigate(['/rooms']);
      }
    });
  }

  playAgain(): void {
    // Logic for playing again or creating new room
    this.router.navigate(['/rooms/create']);
  }

  sendChatMessage(): void {
    if (!this.chatMessage.trim()) return;

    this.wsService.sendChatMessage(this.roomId, this.chatMessage);
    this.chatMessage = '';
  }

  getGameIcon(gameType: string): string {
    const icons: { [key: string]: string } = {
      'SUDOKU': 'grid_3x3',
      'CROSSWORD': 'apps',
      'WORD_SEARCH': 'search',
      'CODE_CHALLENGE': 'code',
      'MATH_PUZZLE': 'calculate'
    };
    return icons[gameType] || 'games';
  }

  getGameDisplayName(gameType: string): string {
    const names: { [key: string]: string } = {
      'SUDOKU': 'Sudoku',
      'CROSSWORD': 'Crossword',
      'WORD_SEARCH': 'Word Search',
      'CODE_CHALLENGE': 'Code Challenge',
      'MATH_PUZZLE': 'Math Puzzle'
    };
    return names[gameType] || gameType;
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getTimePercentage(): number {
    const room = this.room();
    if (!room) return 0;
    const totalTime = room.gameConfig.timeLimit;
    const remaining = this.timeRemaining();
    return ((totalTime - remaining) / totalTime) * 100;
  }

  getPlayerScore(playerId: string): number {
    // Mock implementation - replace with actual score logic
    return 0;
  }

  isPlayerReady(playerId: string): boolean {
    // Mock implementation - replace with actual ready status
    return Math.random() > 0.5;
  }

  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diff = now.getTime() - messageTime.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    return messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
