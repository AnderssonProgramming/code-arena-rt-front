import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { RoomService } from '../../core/services/room.service';
import { GameHistoryService } from '../../core/services/game-history.service';
import { GameSession } from '../../core/models/interfaces';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBadgeModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Welcome Header -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            Welcome back, {{getUserDisplayName()}}!
          </h1>
          <p class="welcome-subtitle">Ready to challenge your mind?</p>
        </div>
        <div class="user-avatar">
          <div class="avatar-circle">
            @if (getUserAvatar()) {
              <img [src]="getUserAvatar()" [alt]="currentUser()?.username">
            } @else {
              <mat-icon>person</mat-icon>
            }
          </div>
          <div class="level-badge">
            <span>LVL {{getUserLevel()}}</span>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon games">sports_esports</mat-icon>
              <div class="stat-info">
                <h3>{{getUserStats().gamesPlayed}}</h3>
                <p>Games Played</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon wins">emoji_events</mat-icon>
              <div class="stat-info">
                <h3>{{getUserStats().gamesWon}}</h3>
                <p>Victories</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon winrate">trending_up</mat-icon>
              <div class="stat-info">
                <h3>{{getWinRate()}}%</h3>
                <p>Win Rate</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon streak">local_fire_department</mat-icon>
              <div class="stat-info">
                <h3>{{getUserStats().currentStreak}}</h3>
                <p>Current Streak</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Main Action Cards -->
      <div class="action-cards">
        <!-- Quick Play -->
        <mat-card class="action-card primary">
          <mat-card-header>
            <mat-icon mat-card-avatar>flash_on</mat-icon>
            <mat-card-title>Quick Play</mat-card-title>
            <mat-card-subtitle>Jump into a random game immediately</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Find an available room and start playing within seconds!</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="quickPlay()" [disabled]="isLoading()">
              <mat-icon>play_arrow</mat-icon>
              Quick Play
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Browse Rooms -->
        <mat-card class="action-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>meeting_room</mat-icon>
            <mat-card-title>Browse Rooms</mat-card-title>
            <mat-card-subtitle>Choose from available game rooms</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Explore different game modes and difficulty levels</p>
            @if (activeRooms() > 0) {
              <mat-chip-set>
                <mat-chip [matBadge]="activeRooms()" matBadgeOverlap="false">
                  Active Rooms
                </mat-chip>
              </mat-chip-set>
            }
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button routerLink="/rooms">
              <mat-icon>search</mat-icon>
              Browse Rooms
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Create Room -->
        <mat-card class="action-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>add_circle</mat-icon>
            <mat-card-title>Create Room</mat-card-title>
            <mat-card-subtitle>Host your own game session</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Customize game settings and invite friends to play</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button routerLink="/rooms/create">
              <mat-icon>add</mat-icon>
              Create Room
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Recent Activity -->
      <div class="recent-section">
        <h2>Recent Activity</h2>
        
        @if (recentGames().length > 0) {
          <div class="recent-games">
            @for (game of recentGames(); track game.id) {
              <mat-card class="game-card">
                <mat-card-content>
                  <div class="game-info">
                    <div class="game-header">
                      <mat-icon [class]="'game-type-icon ' + game.gameType">
                        {{getGameIcon(game.gameType)}}
                      </mat-icon>
                      <div class="game-details">
                        <h4>{{getGameDisplayName(game.gameType)}}</h4>
                        <p class="game-time">{{getTimeAgo(game.endedAt)}}</p>
                      </div>
                    </div>
                    <div class="game-result">
                      @if (game.winnerId === currentUser()?.id) {
                        <mat-chip class="result-chip win">Victory</mat-chip>
                      } @else {
                        <mat-chip class="result-chip loss">Defeat</mat-chip>
                      }
                      <span class="score">{{game.userScore}}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>
        } @else {
          <mat-card class="empty-state">
            <mat-card-content>
              <mat-icon class="empty-icon">games</mat-icon>
              <h3>No recent games</h3>
              <p>Start playing to see your game history here!</p>
              <button mat-raised-button color="primary" (click)="quickPlay()">
                <mat-icon>play_arrow</mat-icon>
                Start Your First Game
              </button>
            </mat-card-content>
          </mat-card>
        }
      </div>

      <!-- Experience Progress -->
      @if (currentUser()?.profile) {
        <div class="progress-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Experience Progress</mat-card-title>
              <mat-card-subtitle>Level {{getUserLevel()}} Progress</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="progress-info">
                <span>{{getUserExperience()}} / {{getNextLevelExp()}} XP</span>
                <span>{{getExpToNextLevel()}} XP to next level</span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="getExpPercentage()"
                class="exp-progress">
              </mat-progress-bar>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      color: white;
    }

    .welcome-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .welcome-subtitle {
      font-size: 1.1rem;
      margin: 0;
      opacity: 0.9;
    }

    .user-avatar {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid rgba(255, 255, 255, 0.3);

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
      }

      mat-icon {
        font-size: 2rem;
        color: white;
      }
    }

    .level-badge {
      position: absolute;
      bottom: -10px;
      background: #fbbf24;
      color: #1f2937;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.75rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .stat-icon {
        font-size: 2rem;
        padding: 0.75rem;
        border-radius: 12px;
        
        &.games { background: #ddd6fe; color: #7c3aed; }
        &.wins { background: #fef3c7; color: #d97706; }
        &.winrate { background: #d1fae5; color: #059669; }
        &.streak { background: #fed7d7; color: #e53e3e; }
      }

      .stat-info h3 {
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0;
        color: #1f2937;
      }

      .stat-info p {
        margin: 0;
        color: #6b7280;
        font-size: 0.875rem;
      }
    }

    .action-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .action-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      &.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        mat-card-title, mat-card-subtitle {
          color: white;
        }
      }

      mat-card-header {
        mat-icon[mat-card-avatar] {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1.5rem;
        }
      }

      mat-card-actions {
        padding-top: 1rem;
      }
    }

    .recent-section {
      margin-bottom: 2rem;

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #1f2937;
      }
    }

    .recent-games {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .game-card {
      .game-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .game-header {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .game-type-icon {
        font-size: 1.5rem;
        padding: 0.5rem;
        border-radius: 8px;
        background: #f3f4f6;
      }

      .game-details h4 {
        margin: 0;
        font-weight: 600;
      }

      .game-time {
        margin: 0;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .game-result {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .result-chip {
        &.win { background: #d1fae5; color: #059669; }
        &.loss { background: #fee2e2; color: #dc2626; }
      }

      .score {
        font-weight: 600;
        font-size: 1.1rem;
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;

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

    .progress-section {
      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
      }

      .exp-progress {
        height: 8px;
        border-radius: 4px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .welcome-section {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .action-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly roomService = inject(RoomService);
  private readonly gameHistoryService = inject(GameHistoryService);
  private readonly router = inject(Router);

  // Reactive signals
  currentUser = this.authService.currentUser;
  isLoading = signal(false);
  activeRooms = signal(0);
  recentGames = signal<GameSession[]>([]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    // Load active rooms count
    this.roomService.getActiveRoomsCount().subscribe({
      next: (count: number) => this.activeRooms.set(count),
      error: (error: any) => console.error('Error loading active rooms:', error)
    });

    // Load recent games
    this.gameHistoryService.getRecentGames(5).subscribe({
      next: (games) => this.recentGames.set(games),
      error: (error) => console.error('Error loading recent games:', error)
    });
  }

  quickPlay(): void {
    if (this.isLoading()) return;
    
    this.isLoading.set(true);
    this.roomService.findQuickMatch().subscribe({
      next: (room) => {
        this.router.navigate(['/game', room.id]);
      },
      error: (error) => {
        console.error('Quick play error:', error);
        this.isLoading.set(false);
        // Fallback to room browser
        this.router.navigate(['/rooms']);
      }
    });
  }

  getWinRate(): number {
    const user = this.currentUser();
    if (!user?.stats || user.stats.gamesPlayed === 0) return 0;
    return Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100);
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

  getTimeAgo(date: Date | undefined): string {
    if (!date) return 'Unknown time';
    const now = new Date();
    const gameDate = new Date(date);
    const diffMs = now.getTime() - gameDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  getNextLevelExp(): number {
    const level = this.currentUser()?.profile.level ?? 1;
    return level * 1000; // Simple progression: 1000 XP per level
  }

  getExpToNextLevel(): number {
    const user = this.currentUser();
    if (!user?.profile) return 0;
    return this.getNextLevelExp() - user.profile.experience;
  }

  getExpPercentage(): number {
    const user = this.currentUser();
    if (!user?.profile) return 0;
    const nextLevelExp = this.getNextLevelExp();
    const currentLevelExp = (user.profile.level - 1) * 1000;
    const progressExp = user.profile.experience - currentLevelExp;
    const levelExpRange = nextLevelExp - currentLevelExp;
    return (progressExp / levelExpRange) * 100;
  }

  // Helper methods for safe access to user properties
  getUserDisplayName(): string {
    const user = this.currentUser();
    return user?.profile?.displayName ?? user?.username ?? 'Unknown User';
  }

  getUserAvatar(): string | null {
    return this.currentUser()?.profile?.avatar ?? null;
  }

  getUserLevel(): number {
    return this.currentUser()?.profile?.level ?? 1;
  }

  getUserExperience(): number {
    return this.currentUser()?.profile?.experience ?? 0;
  }

  getUserStats() {
    return {
      gamesPlayed: this.currentUser()?.stats?.gamesPlayed ?? 0,
      gamesWon: this.currentUser()?.stats?.gamesWon ?? 0,
      currentStreak: this.currentUser()?.stats?.currentStreak ?? 0,
      averageScore: this.currentUser()?.stats?.averageScore ?? 0,
      bestStreak: this.currentUser()?.stats?.bestStreak ?? 0,
      totalPlayTime: this.currentUser()?.stats?.totalPlayTime ?? 0
    };
  }
}
