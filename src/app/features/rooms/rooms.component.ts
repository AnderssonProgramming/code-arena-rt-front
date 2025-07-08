import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RoomService } from '../../../core/services/room.service';
import { Room, GameType } from '../../../core/models/interfaces';

@Component({
  selector: 'app-rooms',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonToggleModule
  ],
  template: `
    <div class="rooms-container">
      <!-- Header Section -->
      <div class="rooms-header">
        <div class="header-content">
          <h1>Game Rooms</h1>
          <p>Join an existing room or create your own!</p>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/rooms/create">
            <mat-icon>add</mat-icon>
            Create Room
          </button>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="filters-section">
        <mat-card class="filters-card">
          <mat-card-content>
            <div class="filters-grid">
              <!-- Search -->
              <mat-form-field appearance="outline">
                <mat-label>Search rooms</mat-label>
                <input matInput [(ngModel)]="searchText()" placeholder="Search by name or description">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <!-- Game Type Filter -->
              <mat-form-field appearance="outline">
                <mat-label>Game Type</mat-label>
                <mat-select [(ngModel)]="selectedGameType()" multiple>
                  @for (gameType of gameTypes; track gameType.value) {
                    <mat-option [value]="gameType.value">{{gameType.label}}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <!-- Difficulty Filter -->
              <mat-form-field appearance="outline">
                <mat-label>Difficulty</mat-label>
                <mat-select [(ngModel)]="selectedDifficulty()">
                  <mat-option value="">All</mat-option>
                  <mat-option value="EASY">Easy</mat-option>
                  <mat-option value="MEDIUM">Medium</mat-option>
                  <mat-option value="HARD">Hard</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Room Status Filter -->
              <div class="filter-toggles">
                <mat-button-toggle-group [(ngModel)]="roomStatusFilter()">
                  <mat-button-toggle value="ALL">All</mat-button-toggle>
                  <mat-button-toggle value="WAITING">Waiting</mat-button-toggle>
                  <mat-button-toggle value="IN_PROGRESS">Playing</mat-button-toggle>
                </mat-button-toggle-group>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button mat-stroked-button (click)="refreshRooms()" [disabled]="isLoading()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
        <button mat-stroked-button (click)="quickPlay()" [disabled]="isLoading()">
          <mat-icon>flash_on</mat-icon>
          Quick Play
        </button>
      </div>

      <!-- Rooms Grid -->
      <div class="rooms-content">
        @if (isLoading()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Loading rooms...</p>
          </div>
        } @else if (filteredRooms().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-icon">meeting_room</mat-icon>
            <h3>No rooms found</h3>
            <p>Try adjusting your filters or create a new room to get started!</p>
            <button mat-raised-button color="primary" routerLink="/rooms/create">
              <mat-icon>add</mat-icon>
              Create First Room
            </button>
          </div>
        } @else {
          <div class="rooms-grid">
            @for (room of filteredRooms(); track room.id) {
              <mat-card class="room-card" [class.full]="isRoomFull(room)" [class.playing]="room.status === 'IN_PROGRESS'">
                <mat-card-header>
                  <div mat-card-avatar class="room-avatar">
                    <mat-icon>{{getGameIcon(room.gameConfig.gameType)}}</mat-icon>
                  </div>
                  <mat-card-title>{{room.name}}</mat-card-title>
                  <mat-card-subtitle>
                    <div class="room-meta">
                      <span class="game-type">{{getGameDisplayName(room.gameConfig.gameType)}}</span>
                      <mat-chip [class]="'difficulty-' + room.gameConfig.difficulty.toLowerCase()">
                        {{room.gameConfig.difficulty}}
                      </mat-chip>
                    </div>
                  </mat-card-subtitle>
                </mat-card-header>

                <mat-card-content>
                  <div class="room-info">
                    @if (room.description) {
                      <p class="room-description">{{room.description}}</p>
                    }
                    
                    <div class="room-details">
                      <div class="detail-item">
                        <mat-icon>people</mat-icon>
                        <span>{{room.currentPlayers.length}}/{{room.maxPlayers}} players</span>
                      </div>
                      
                      <div class="detail-item">
                        <mat-icon>schedule</mat-icon>
                        <span>{{formatDuration(room.gameConfig.timeLimit)}}</span>
                      </div>

                      @if (room.isPrivate) {
                        <div class="detail-item">
                          <mat-icon>lock</mat-icon>
                          <span>Private</span>
                        </div>
                      }
                    </div>

                    <div class="players-list">
                      <h4>Players:</h4>
                      <div class="players">
                        @for (player of room.currentPlayers; track player.id) {
                          <div class="player-chip">
                            <mat-icon *ngIf="player.id === room.ownerId" class="owner-icon">star</mat-icon>
                            <span>{{player.username}}</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </mat-card-content>

                <mat-card-actions>
                  <div class="room-actions">
                    <div class="status-indicator">
                      <mat-chip [class]="'status-' + room.status.toLowerCase().replace('_', '-')">
                        {{getStatusLabel(room.status)}}
                      </mat-chip>
                    </div>
                    
                    <div class="action-buttons">
                      @if (room.status === 'WAITING' && !isRoomFull(room)) {
                        <button mat-raised-button color="primary" (click)="joinRoom(room)" [disabled]="isJoining()">
                          <mat-icon>login</mat-icon>
                          Join
                        </button>
                      } @else if (room.status === 'WAITING' && isRoomFull(room)) {
                        <button mat-stroked-button disabled>
                          <mat-icon>block</mat-icon>
                          Full
                        </button>
                      } @else if (room.status === 'IN_PROGRESS') {
                        <button mat-stroked-button disabled>
                          <mat-icon>play_arrow</mat-icon>
                          Playing
                        </button>
                      }
                      
                      <button mat-icon-button (click)="viewRoomDetails(room)" matTooltip="View Details">
                        <mat-icon>info</mat-icon>
                      </button>
                    </div>
                  </div>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .rooms-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .rooms-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
        color: #1f2937;
      }

      p {
        color: #6b7280;
        margin: 0;
        font-size: 1.1rem;
      }
    }

    .filters-section {
      margin-bottom: 1.5rem;
    }

    .filters-card {
      .filters-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 1rem;
        align-items: center;
      }

      .filter-toggles {
        display: flex;
        justify-content: center;
      }
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;

      p {
        margin-top: 1rem;
        color: #6b7280;
      }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      .empty-icon {
        font-size: 4rem;
        color: #d1d5db;
        margin-bottom: 1rem;
      }

      h3 {
        color: #6b7280;
        margin-bottom: 0.5rem;
      }

      p {
        color: #9ca3af;
        margin-bottom: 2rem;
      }
    }

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .room-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 12px;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      &.full {
        opacity: 0.7;
      }

      &.playing {
        border-left: 4px solid #10b981;
      }

      .room-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .room-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.25rem;

        .game-type {
          font-weight: 500;
        }
      }
    }

    .room-info {
      .room-description {
        color: #6b7280;
        margin-bottom: 1rem;
        font-size: 0.9rem;
      }

      .room-details {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;

          mat-icon {
            font-size: 1rem;
            width: 1rem;
            height: 1rem;
          }
        }
      }

      .players-list {
        h4 {
          font-size: 0.875rem;
          color: #374151;
          margin: 0 0 0.5rem 0;
        }

        .players {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;

          .player-chip {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            background: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-size: 0.75rem;

            .owner-icon {
              font-size: 0.875rem;
              color: #fbbf24;
            }
          }
        }
      }
    }

    .room-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    }

    // Chip color variants
    .difficulty-easy { background: #d1fae5; color: #059669; }
    .difficulty-medium { background: #fef3c7; color: #d97706; }
    .difficulty-hard { background: #fee2e2; color: #dc2626; }

    .status-waiting { background: #dbeafe; color: #1d4ed8; }
    .status-in-progress { background: #d1fae5; color: #059669; }
    .status-finished { background: #f3f4f6; color: #6b7280; }

    @media (max-width: 768px) {
      .rooms-container {
        padding: 1rem;
      }

      .rooms-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .filters-grid {
        grid-template-columns: 1fr !important;
      }

      .rooms-grid {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        justify-content: center;
      }
    }
  `]
})
export class RoomsComponent implements OnInit {
  private roomService = inject(RoomService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Reactive signals
  rooms = signal<Room[]>([]);
  isLoading = signal(false);
  isJoining = signal(false);
  searchText = signal('');
  selectedGameType = signal<string[]>([]);
  selectedDifficulty = signal('');
  roomStatusFilter = signal('ALL');

  // Game types configuration
  gameTypes = [
    { value: 'SUDOKU', label: 'Sudoku' },
    { value: 'CROSSWORD', label: 'Crossword' },
    { value: 'WORD_SEARCH', label: 'Word Search' },
    { value: 'CODE_CHALLENGE', label: 'Code Challenge' },
    { value: 'MATH_PUZZLE', label: 'Math Puzzle' }
  ];

  // Computed filtered rooms
  filteredRooms = computed(() => {
    let filtered = this.rooms();

    // Filter by search text
    if (this.searchText()) {
      const search = this.searchText().toLowerCase();
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(search) ||
        (room.description?.toLowerCase().includes(search) ?? false)
      );
    }

    // Filter by game type
    if (this.selectedGameType().length > 0) {
      filtered = filtered.filter(room => 
        this.selectedGameType().includes(room.gameConfig.gameType)
      );
    }

    // Filter by difficulty
    if (this.selectedDifficulty()) {
      filtered = filtered.filter(room => 
        room.gameConfig.difficulty === this.selectedDifficulty()
      );
    }

    // Filter by status
    if (this.roomStatusFilter() !== 'ALL') {
      filtered = filtered.filter(room => room.status === this.roomStatusFilter());
    }

    return filtered;
  });

  ngOnInit(): void {
    this.loadRooms();
    
    // Auto-refresh rooms every 30 seconds
    setInterval(() => {
      if (!this.isLoading()) {
        this.loadRooms();
      }
    }, 30000);
  }

  loadRooms(): void {
    this.isLoading.set(true);
    this.roomService.getAvailableRooms().subscribe({
      next: (rooms) => {
        this.rooms.set(rooms);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        this.snackBar.open('Failed to load rooms', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  refreshRooms(): void {
    this.loadRooms();
  }

  joinRoom(room: Room): void {
    if (this.isJoining()) return;
    
    this.isJoining.set(true);
    this.roomService.joinRoom(room.id).subscribe({
      next: () => {
        this.snackBar.open(`Joined room: ${room.name}`, 'Close', { duration: 3000 });
        this.router.navigate(['/game', room.id]);
      },
      error: (error) => {
        console.error('Error joining room:', error);
        let message = 'Failed to join room';
        if (error.error?.message) {
          message = error.error.message;
        }
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.isJoining.set(false);
      }
    });
  }

  quickPlay(): void {
    this.isLoading.set(true);
    this.roomService.findQuickMatch().subscribe({
      next: (room) => {
        this.router.navigate(['/game', room.id]);
      },
      error: (error) => {
        console.error('Quick play error:', error);
        this.snackBar.open('No available rooms for quick play', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  viewRoomDetails(room: Room): void {
    // Navigate to room details page
    this.router.navigate(['/rooms', room.id]);
  }

  isRoomFull(room: Room): boolean {
    return room.currentPlayers.length >= room.maxPlayers;
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

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'WAITING': 'Waiting for players',
      'IN_PROGRESS': 'Game in progress',
      'FINISHED': 'Finished'
    };
    return labels[status] || status;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  }
}
