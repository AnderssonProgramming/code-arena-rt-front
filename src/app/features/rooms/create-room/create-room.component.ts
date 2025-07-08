import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { RoomService } from '../../../core/services/room.service';
import { CreateRoomRequest } from '../../../core/services/room.service';

@Component({
  selector: 'app-create-room',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  template: `
    <div class="create-room-container">
      <div class="header">
        <button mat-icon-button routerLink="/rooms" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Create New Room</h1>
      </div>

      <mat-card class="create-room-card">
        <mat-horizontal-stepper [linear]="false" #stepper>
          <!-- Basic Information -->
          <mat-step [stepControl]="basicInfoForm" label="Basic Information">
            <form [formGroup]="basicInfoForm" class="step-form">
              <h3>Room Details</h3>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Room Name</mat-label>
                <input matInput formControlName="name" placeholder="Enter a catchy room name">
                <mat-icon matSuffix>title</mat-icon>
                <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                  Room name is required
                </mat-error>
                <mat-error *ngIf="basicInfoForm.get('name')?.hasError('minlength')">
                  Room name must be at least 3 characters
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description (Optional)</mat-label>
                <textarea 
                  matInput 
                  formControlName="description" 
                  placeholder="Describe your room or add any special rules"
                  rows="3">
                </textarea>
                <mat-icon matSuffix>description</mat-icon>
              </mat-form-field>

              <div class="privacy-settings">
                <mat-checkbox formControlName="isPrivate">
                  Make this room private
                </mat-checkbox>
                
                <mat-form-field 
                  appearance="outline" 
                  class="full-width"
                  *ngIf="basicInfoForm.get('isPrivate')?.value">
                  <mat-label>Room Password</mat-label>
                  <input 
                    matInput 
                    formControlName="password" 
                    type="password"
                    placeholder="Enter room password">
                  <mat-icon matSuffix>lock</mat-icon>
                  <mat-error *ngIf="basicInfoForm.get('password')?.hasError('required')">
                    Password is required for private rooms
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="step-actions">
                <button mat-raised-button color="primary" (click)="stepper.next()">
                  Next
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Game Configuration -->
          <mat-step [stepControl]="gameConfigForm" label="Game Settings">
            <form [formGroup]="gameConfigForm" class="step-form">
              <h3>Game Configuration</h3>

              <div class="game-config-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Game Type</mat-label>
                  <mat-select formControlName="gameType">
                    @for (gameType of gameTypes; track gameType.value) {
                      <mat-option [value]="gameType.value">
                        <div class="game-option">
                          <mat-icon>{{gameType.icon}}</mat-icon>
                          <span>{{gameType.label}}</span>
                        </div>
                      </mat-option>
                    }
                  </mat-select>
                  <mat-error *ngIf="gameConfigForm.get('gameType')?.hasError('required')">
                    Please select a game type
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Difficulty</mat-label>
                  <mat-select formControlName="difficulty">
                    <mat-option value="EASY">
                      <div class="difficulty-option easy">
                        <mat-icon>sentiment_very_satisfied</mat-icon>
                        <span>Easy</span>
                      </div>
                    </mat-option>
                    <mat-option value="MEDIUM">
                      <div class="difficulty-option medium">
                        <mat-icon>sentiment_neutral</mat-icon>
                        <span>Medium</span>
                      </div>
                    </mat-option>
                    <mat-option value="HARD">
                      <div class="difficulty-option hard">
                        <mat-icon>sentiment_very_dissatisfied</mat-icon>
                        <span>Hard</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="slider-group">
                <label class="slider-label">
                  <mat-icon>people</mat-icon>
                  Max Players: {{gameConfigForm.get('maxPlayers')?.value}}
                </label>
                <mat-slider 
                  min="2" 
                  max="8" 
                  step="1" 
                  [value]="gameConfigForm.get('maxPlayers')?.value"
                  (input)="updateMaxPlayers($event)">
                </mat-slider>
                <div class="slider-range">
                  <span>2</span>
                  <span>8</span>
                </div>
              </div>

              <div class="slider-group">
                <label class="slider-label">
                  <mat-icon>schedule</mat-icon>
                  Time Limit: {{formatTime(gameConfigForm.get('timeLimit')?.value)}}
                </label>
                <mat-slider 
                  min="300" 
                  max="3600" 
                  step="300"
                  [value]="gameConfigForm.get('timeLimit')?.value"
                  (input)="updateTimeLimit($event)">
                </mat-slider>
                <div class="slider-range">
                  <span>5min</span>
                  <span>60min</span>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button (click)="stepper.previous()">
                  Back
                </button>
                <button mat-raised-button color="primary" (click)="stepper.next()">
                  Next
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Review and Create -->
          <mat-step label="Review & Create">
            <div class="review-step">
              <h3>Review Your Room</h3>
              
              <div class="review-sections">
                <div class="review-section">
                  <h4>Basic Information</h4>
                  <div class="review-item">
                    <strong>Name:</strong> {{basicInfoForm.get('name')?.value}}
                  </div>
                  <div class="review-item" *ngIf="basicInfoForm.get('description')?.value">
                    <strong>Description:</strong> {{basicInfoForm.get('description')?.value}}
                  </div>
                  <div class="review-item">
                    <strong>Privacy:</strong> 
                    {{basicInfoForm.get('isPrivate')?.value ? 'Private' : 'Public'}}
                  </div>
                </div>

                <div class="review-section">
                  <h4>Game Settings</h4>
                  <div class="review-item">
                    <strong>Game Type:</strong> {{getGameTypeName(gameConfigForm.get('gameType')?.value)}}
                  </div>
                  <div class="review-item">
                    <strong>Difficulty:</strong> {{gameConfigForm.get('difficulty')?.value}}
                  </div>
                  <div class="review-item">
                    <strong>Max Players:</strong> {{gameConfigForm.get('maxPlayers')?.value}}
                  </div>
                  <div class="review-item">
                    <strong>Time Limit:</strong> {{formatTime(gameConfigForm.get('timeLimit')?.value)}}
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button mat-button (click)="stepper.previous()">
                  Back
                </button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  (click)="createRoom()"
                  [disabled]="isCreating() || !isFormValid()">
                  @if (isCreating()) {
                    <mat-spinner diameter="20"></mat-spinner>
                    <span>Creating...</span>
                  } @else {
                    <mat-icon>add</mat-icon>
                    <span>Create Room</span>
                  }
                </button>
              </div>
            </div>
          </mat-step>
        </mat-horizontal-stepper>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-room-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;

      h1 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        color: #1f2937;
      }

      .back-button {
        background: #f3f4f6;
      }
    }

    .create-room-card {
      padding: 2rem;
    }

    .step-form {
      padding: 1.5rem 0;

      h3 {
        color: #1f2937;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .privacy-settings {
      margin: 1.5rem 0;

      mat-checkbox {
        margin-bottom: 1rem;
      }
    }

    .game-config-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .game-option, .difficulty-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      mat-icon {
        font-size: 1.2rem;
      }
    }

    .difficulty-option {
      &.easy mat-icon { color: #10b981; }
      &.medium mat-icon { color: #f59e0b; }
      &.hard mat-icon { color: #ef4444; }
    }

    .slider-group {
      margin-bottom: 2rem;

      .slider-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        color: #374151;
        margin-bottom: 0.5rem;
      }

      mat-slider {
        width: 100%;
        margin: 1rem 0;
      }

      .slider-range {
        display: flex;
        justify-content: space-between;
        font-size: 0.875rem;
        color: #6b7280;
      }
    }

    .step-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .review-step {
      padding: 1.5rem 0;

      h3 {
        color: #1f2937;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }
    }

    .review-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .review-section {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 8px;

      h4 {
        color: #374151;
        margin-bottom: 1rem;
        font-weight: 600;
        font-size: 1.1rem;
      }

      .review-item {
        margin-bottom: 0.75rem;
        
        strong {
          color: #1f2937;
          margin-right: 0.5rem;
        }
      }
    }

    @media (max-width: 768px) {
      .create-room-container {
        padding: 1rem;
      }

      .game-config-grid {
        grid-template-columns: 1fr;
      }

      .review-sections {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .step-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CreateRoomComponent {
  private fb = inject(FormBuilder);
  private roomService = inject(RoomService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Reactive signals
  isCreating = signal(false);

  // Game types configuration
  gameTypes = [
    { value: 'SUDOKU', label: 'Sudoku', icon: 'grid_3x3' },
    { value: 'CROSSWORD', label: 'Crossword', icon: 'apps' },
    { value: 'WORD_SEARCH', label: 'Word Search', icon: 'search' },
    { value: 'CODE_CHALLENGE', label: 'Code Challenge', icon: 'code' },
    { value: 'MATH_PUZZLE', label: 'Math Puzzle', icon: 'calculate' }
  ];

  // Form groups
  basicInfoForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    isPrivate: [false],
    password: ['']
  });

  gameConfigForm: FormGroup = this.fb.group({
    gameType: ['SUDOKU', [Validators.required]],
    difficulty: ['MEDIUM', [Validators.required]],
    maxPlayers: [4],
    timeLimit: [1800] // 30 minutes default
  });

  constructor() {
    // Dynamic validation for password based on privacy setting
    this.basicInfoForm.get('isPrivate')?.valueChanges.subscribe(isPrivate => {
      const passwordControl = this.basicInfoForm.get('password');
      if (isPrivate) {
        passwordControl?.setValidators([Validators.required, Validators.minLength(4)]);
      } else {
        passwordControl?.clearValidators();
      }
      passwordControl?.updateValueAndValidity();
    });
  }

  updateMaxPlayers(event: any): void {
    this.gameConfigForm.patchValue({ maxPlayers: event.value });
  }

  updateTimeLimit(event: any): void {
    this.gameConfigForm.patchValue({ timeLimit: event.value });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }

  getGameTypeName(gameType: string): string {
    const gameTypeObj = this.gameTypes.find(gt => gt.value === gameType);
    return gameTypeObj?.label || gameType;
  }

  isFormValid(): boolean {
    return this.basicInfoForm.valid && this.gameConfigForm.valid;
  }

  createRoom(): void {
    if (!this.isFormValid() || this.isCreating()) return;

    this.isCreating.set(true);

    const basicInfo = this.basicInfoForm.value;
    const gameConfig = this.gameConfigForm.value;

    const createRoomRequest: CreateRoomRequest = {
      name: basicInfo.name,
      description: basicInfo.description || undefined,
      gameConfig: {
        gameType: gameConfig.gameType,
        difficulty: gameConfig.difficulty,
        timeLimit: gameConfig.timeLimit,
        maxPlayers: gameConfig.maxPlayers
      },
      isPrivate: basicInfo.isPrivate,
      password: basicInfo.isPrivate ? basicInfo.password : undefined
    };

    this.roomService.createRoom(createRoomRequest).subscribe({
      next: (room) => {
        this.snackBar.open(`Room "${room.name}" created successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Navigate to the newly created room
        this.router.navigate(['/game', room.id]);
      },
      error: (error) => {
        console.error('Error creating room:', error);
        let errorMessage = 'Failed to create room. Please try again.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        
        this.isCreating.set(false);
      }
    });
  }
}
