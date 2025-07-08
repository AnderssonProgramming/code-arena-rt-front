import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { GameHistoryService } from '../../../core/services/game-history.service';
import { User, GameSession } from '../../../core/models/interfaces';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <div class="profile-banner">
          <div class="banner-content">
            <div class="user-avatar">
              <div class="avatar-circle">
                @if (currentUser()?.profile.avatar) {
                  <img [src]="currentUser()?.profile.avatar" [alt]="currentUser()?.username">
                } @else {
                  <mat-icon>person</mat-icon>
                }
              </div>
              <button mat-icon-button class="edit-avatar-btn" (click)="editAvatar()">
                <mat-icon>camera_alt</mat-icon>
              </button>
            </div>
            
            <div class="user-info">
              <h1>{{currentUser()?.profile.displayName || currentUser()?.username}}</h1>
              <p class="username">{{currentUser()?.username}}</p>
              <div class="user-meta">
                <div class="level-info">
                  <mat-chip class="level-chip">
                    <mat-icon>star</mat-icon>
                    Level {{currentUser()?.profile.level || 1}}
                  </mat-chip>
                  <span class="exp-text">{{currentUser()?.profile.experience || 0}} XP</span>
                </div>
                <div class="join-date">
                  <mat-icon>calendar_today</mat-icon>
                  <span>Joined {{formatDate(currentUser()?.createdAt)}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <mat-tab-group>
          <!-- Statistics Tab -->
          <mat-tab label="Statistics">
            <div class="tab-content">
              <div class="stats-grid">
                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-item">
                      <mat-icon class="stat-icon games">sports_esports</mat-icon>
                      <div class="stat-details">
                        <h3>{{currentUser()?.stats.gamesPlayed || 0}}</h3>
                        <p>Games Played</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-item">
                      <mat-icon class="stat-icon wins">emoji_events</mat-icon>
                      <div class="stat-details">
                        <h3>{{currentUser()?.stats.gamesWon || 0}}</h3>
                        <p>Victories</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-item">
                      <mat-icon class="stat-icon winrate">trending_up</mat-icon>
                      <div class="stat-details">
                        <h3>{{getWinRate()}}%</h3>
                        <p>Win Rate</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-item">
                      <mat-icon class="stat-icon score">score</mat-icon>
                      <div class="stat-details">
                        <h3>{{Math.round(currentUser()?.stats.averageScore || 0)}}</h3>
                        <p>Avg Score</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-item">
                      <mat-icon class="stat-icon streak">local_fire_department</mat-icon>
                      <div class="stat-details">
                        <h3>{{currentUser()?.stats.bestStreak || 0}}</h3>
                        <p>Best Streak</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="stat-card">
                  <mat-card-content>
                    <div class="stat-item">
                      <mat-icon class="stat-icon time">schedule</mat-icon>
                      <div class="stat-details">
                        <h3>{{formatPlayTime(currentUser()?.stats.totalPlayTime || 0)}}</h3>
                        <p>Play Time</p>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>

              <!-- Experience Progress -->
              <mat-card class="progress-card">
                <mat-card-header>
                  <mat-card-title>Experience Progress</mat-card-title>
                  <mat-card-subtitle>Level {{currentUser()?.profile.level}} → Level {{(currentUser()?.profile.level || 1) + 1}}</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="progress-info">
                    <span>{{currentUser()?.profile.experience || 0}} / {{getNextLevelExp()}} XP</span>
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
          </mat-tab>

          <!-- Game History Tab -->
          <mat-tab label="Game History">
            <div class="tab-content">
              @if (isLoadingHistory()) {
                <div class="loading-container">
                  <mat-progress-spinner></mat-progress-spinner>
                  <p>Loading game history...</p>
                </div>
              } @else if (gameHistory().length === 0) {
                <div class="empty-state">
                  <mat-icon class="empty-icon">games</mat-icon>
                  <h3>No games played yet</h3>
                  <p>Start playing to build your game history!</p>
                  <button mat-raised-button color="primary" routerLink="/rooms">
                    <mat-icon>play_arrow</mat-icon>
                    Browse Games
                  </button>
                </div>
              } @else {
                <div class="history-list">
                  @for (game of gameHistory(); track game.id) {
                    <mat-card class="history-card">
                      <mat-card-content>
                        <div class="game-info">
                          <div class="game-header">
                            <mat-icon [class]="'game-type-icon ' + game.gameType">
                              {{getGameIcon(game.gameType)}}
                            </mat-icon>
                            <div class="game-details">
                              <h4>{{getGameDisplayName(game.gameType)}}</h4>
                              <p class="game-time">{{formatGameTime(game.endedAt)}}</p>
                            </div>
                          </div>
                          
                          <div class="game-stats">
                            <div class="stat">
                              <span class="label">Result:</span>
                              @if (game.winnerId === currentUser()?.id) {
                                <mat-chip class="result-chip win">Victory</mat-chip>
                              } @else {
                                <mat-chip class="result-chip loss">Defeat</mat-chip>
                              }
                            </div>
                            <div class="stat">
                              <span class="label">Score:</span>
                              <span class="value">{{game.userScore || 0}}</span>
                            </div>
                            <div class="stat">
                              <span class="label">Duration:</span>
                              <span class="value">{{formatDuration(game.duration || 0)}}</span>
                            </div>
                          </div>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              }
            </div>
          </mat-tab>

          <!-- Settings Tab -->
          <mat-tab label="Settings">
            <div class="tab-content">
              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>Profile Settings</mat-card-title>
                  <mat-card-subtitle>Update your profile information</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="profileForm" (ngSubmit)="updateProfile()" class="profile-form">
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Display Name</mat-label>
                      <input matInput formControlName="displayName" placeholder="Enter your display name">
                      <mat-icon matSuffix>person</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email" placeholder="Enter your email">
                      <mat-icon matSuffix>email</mat-icon>
                    </mat-form-field>

                    <div class="form-actions">
                      <button 
                        mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="!profileForm.valid || isSaving()">
                        @if (isSaving()) {
                          <mat-progress-spinner diameter="20"></mat-progress-spinner>
                          <span>Saving...</span>
                        } @else {
                          <mat-icon>save</mat-icon>
                          <span>Save Changes</span>
                        }
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>

              <mat-card class="settings-card">
                <mat-card-header>
                  <mat-card-title>Game Preferences</mat-card-title>
                  <mat-card-subtitle>Customize your gaming experience</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="preferences-list">
                    <div class="preference-item">
                      <div class="preference-info">
                        <h4>Sound Effects</h4>
                        <p>Enable sound effects during games</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="soundEnabled" (change)="updatePreference('sound', $event.checked)">
                      </mat-slide-toggle>
                    </div>
                    
                    <div class="preference-item">
                      <div class="preference-info">
                        <h4>Notifications</h4>
                        <p>Receive notifications for game invites and updates</p>
                      </div>
                      <mat-slide-toggle [(ngModel)]="notificationsEnabled" (change)="updatePreference('notifications', $event.checked)">
                      </mat-slide-toggle>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    }

    .profile-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0;
      margin-bottom: 2rem;
    }

    .profile-banner {
      padding: 3rem 2rem 2rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .user-avatar {
      position: relative;
      flex-shrink: 0;

      .avatar-circle {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 4px solid rgba(255, 255, 255, 0.3);
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        mat-icon {
          font-size: 3rem;
          color: white;
        }
      }

      .edit-avatar-btn {
        position: absolute;
        bottom: 5px;
        right: 5px;
        background: #3b82f6;
        color: white;
        width: 32px;
        height: 32px;

        mat-icon {
          font-size: 1.2rem;
        }
      }
    }

    .user-info {
      flex: 1;

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
      }

      .username {
        font-size: 1.2rem;
        opacity: 0.9;
        margin: 0 0 1rem 0;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .level-info {
          display: flex;
          align-items: center;
          gap: 1rem;

          .level-chip {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-weight: 600;

            mat-icon {
              color: #fbbf24;
            }
          }

          .exp-text {
            font-size: 0.9rem;
            opacity: 0.8;
          }
        }

        .join-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;

          mat-icon {
            font-size: 1rem;
          }
        }
      }
    }

    .profile-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem 2rem 2rem;
    }

    .tab-content {
      padding: 2rem 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      .stat-item {
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
        &.score { background: #dbeafe; color: #1d4ed8; }
        &.streak { background: #fed7d7; color: #e53e3e; }
        &.time { background: #f3e8ff; color: #8b5cf6; }
      }

      .stat-details {
        h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: #1f2937;
        }

        p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
      }
    }

    .progress-card {
      .progress-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.875rem;
        color: #6b7280;
      }

      .exp-progress {
        height: 12px;
        border-radius: 6px;
      }
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

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .history-card {
      .game-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .game-header {
        display: flex;
        align-items: center;
        gap: 1rem;

        .game-type-icon {
          font-size: 1.5rem;
          padding: 0.5rem;
          border-radius: 8px;
          background: #f3f4f6;
        }

        .game-details {
          h4 {
            margin: 0;
            font-weight: 600;
            color: #1f2937;
          }

          .game-time {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
          }
        }
      }

      .game-stats {
        display: flex;
        gap: 2rem;
        align-items: center;

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          .label {
            font-size: 0.875rem;
            color: #6b7280;
          }

          .value {
            font-weight: 600;
            color: #1f2937;
          }
        }

        .result-chip {
          &.win { background: #d1fae5; color: #059669; }
          &.loss { background: #fee2e2; color: #dc2626; }
        }
      }
    }

    .settings-card {
      margin-bottom: 2rem;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .full-width {
        width: 100%;
      }

      .form-actions {
        margin-top: 1rem;
      }
    }

    .preferences-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;

      .preference-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f9fafb;
        border-radius: 8px;

        .preference-info {
          h4 {
            margin: 0 0 0.25rem 0;
            color: #1f2937;
            font-weight: 600;
          }

          p {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .banner-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .user-info h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .game-info {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 1rem;
      }

      .game-stats {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 0.5rem !important;
      }

      .preference-item {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 1rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private gameHistoryService = inject(GameHistoryService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Reactive signals
  currentUser = this.authService.currentUser;
  gameHistory = signal<GameSession[]>([]);
  isLoadingHistory = signal(false);
  isSaving = signal(false);

  // Form
  profileForm: FormGroup = this.fb.group({
    displayName: [this.currentUser()?.profile.displayName || '', [Validators.required]],
    email: [this.currentUser()?.email || '', [Validators.required, Validators.email]]
  });

  // Preferences
  soundEnabled = this.currentUser()?.settings.soundEnabled || true;
  notificationsEnabled = this.currentUser()?.settings.notifications || true;

  // Math reference for template
  Math = Math;

  ngOnInit(): void {
    this.loadGameHistory();
    this.initializeForm();
  }

  private initializeForm(): void {
    const user = this.currentUser();
    if (user) {
      this.profileForm.patchValue({
        displayName: user.profile.displayName,
        email: user.email
      });
    }
  }

  private loadGameHistory(): void {
    this.isLoadingHistory.set(true);
    this.gameHistoryService.getRecentGames(20).subscribe({
      next: (games) => {
        this.gameHistory.set(games);
        this.isLoadingHistory.set(false);
      },
      error: (error) => {
        console.error('Error loading game history:', error);
        this.isLoadingHistory.set(false);
      }
    });
  }

  updateProfile(): void {
    if (!this.profileForm.valid || this.isSaving()) return;

    this.isSaving.set(true);
    const formValue = this.profileForm.value;

    this.authService.updateProfile({
      profile: {
        ...this.currentUser()?.profile,
        displayName: formValue.displayName
      },
      email: formValue.email
    } as Partial<User>).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.isSaving.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.snackBar.open('Failed to update profile', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isSaving.set(false);
      }
    });
  }

  updatePreference(type: string, value: boolean): void {
    const settings = {
      ...this.currentUser()?.settings,
      [type === 'sound' ? 'soundEnabled' : 'notifications']: value
    };

    this.authService.updateProfile({
      settings
    } as Partial<User>).subscribe({
      next: () => {
        this.snackBar.open('Preference updated', 'Close', { duration: 2000 });
      },
      error: (error) => {
        console.error('Error updating preference:', error);
      }
    });
  }

  editAvatar(): void {
    // TODO: Implement avatar upload
    this.snackBar.open('Avatar upload coming soon!', 'Close', { duration: 3000 });
  }

  getWinRate(): number {
    const user = this.currentUser();
    if (!user?.stats || user.stats.gamesPlayed === 0) return 0;
    return Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100);
  }

  getNextLevelExp(): number {
    const level = this.currentUser()?.profile.level || 1;
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
    return Math.max(0, Math.min(100, (progressExp / levelExpRange) * 100));
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatGameTime(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
}
