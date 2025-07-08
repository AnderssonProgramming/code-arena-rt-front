import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameSession } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-code-challenge-game',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="game-placeholder">
      <mat-card>
        <mat-card-content>
          <div class="placeholder-content">
            <mat-icon class="placeholder-icon">code</mat-icon>
            <h3>Code Challenge</h3>
            <p>Solve programming challenges and compete with other developers!</p>
            <div class="features">
              <div class="feature">
                <mat-icon>check</mat-icon>
                <span>Multiple programming languages</span>
              </div>
              <div class="feature">
                <mat-icon>check</mat-icon>
                <span>Code editor with syntax highlighting</span>
              </div>
              <div class="feature">
                <mat-icon>check</mat-icon>
                <span>Real-time code execution and testing</span>
              </div>
            </div>
            <button mat-raised-button color="primary" disabled>
              <mat-icon>construction</mat-icon>
              In Development
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .game-placeholder {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      
      mat-card {
        max-width: 500px;
        text-align: center;
      }
      
      .placeholder-content {
        padding: 2rem;
        
        .placeholder-icon {
          font-size: 4rem;
          color: #6b7280;
          margin-bottom: 1rem;
        }
        
        h3 {
          color: #1f2937;
          margin-bottom: 1rem;
        }
        
        p {
          color: #6b7280;
          margin-bottom: 2rem;
        }
        
        .features {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 2rem;
          text-align: left;
          
          .feature {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            
            mat-icon {
              color: #10b981;
              font-size: 1.2rem;
            }
          }
        }
      }
    }
  `]
})
export class CodeChallengeGameComponent {
  @Input() gameSession: GameSession | null = null;
}
