import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GameSession } from '../../../../core/models/interfaces';

interface CrosswordCell {
  letter: string;
  isBlocked: boolean;
  userInput: string;
  number?: number;
  isCorrect?: boolean;
}

interface CrosswordClue {
  number: number;
  clue: string;
  answer: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  isCompleted: boolean;
}

@Component({
  selector: 'app-crossword-game',
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatProgressBarModule
  ],
  template: `
    <div class="crossword-game">
      <div class="game-header">
        <h2>
          <mat-icon>apps</mat-icon>
          Crossword Puzzle
        </h2>
        <div class="score-info">
          <div class="score">Score: {{ score() }}</div>
          <div class="progress">
            <span>Progress: {{ completedClues() }}/{{ totalClues() }}</span>
            <mat-progress-bar 
              mode="determinate" 
              [value]="progressPercentage()">
            </mat-progress-bar>
          </div>
        </div>
      </div>

      <div class="game-content">
        <div class="crossword-grid">
          <div class="grid-container">
            <div 
              class="grid-row" 
              *ngFor="let row of grid; let i = index"
            >
              <div 
                class="grid-cell" 
                *ngFor="let cell of row; let j = index"
                [class.blocked]="cell.isBlocked"
                [class.correct]="cell.isCorrect"
                [class.selected]="selectedCell()?.row === i && selectedCell()?.col === j"
                (click)="selectCell(i, j)"
              >
                <span class="cell-number" *ngIf="cell.number">{{ cell.number }}</span>
                <input 
                  *ngIf="!cell.isBlocked"
                  type="text" 
                  maxlength="1"
                  [(ngModel)]="cell.userInput"
                  (input)="onCellInput(i, j, $event)"
                  (keydown)="onKeyDown($event, i, j)"
                  [readonly]="gameCompleted()"
                  class="cell-input"
                >
              </div>
            </div>
          </div>
        </div>

        <div class="clues-panel">
          <div class="clues-section">
            <h3>
              <mat-icon>trending_flat</mat-icon>
              Across
            </h3>
            <mat-list class="clues-list">
              <mat-list-item 
                *ngFor="let clue of acrossClues"
                [class.completed]="clue.isCompleted"
                [class.selected]="selectedClue()?.number === clue.number && selectedClue()?.direction === 'across'"
                (click)="selectClue(clue)"
              >
                <div class="clue-content">
                  <span class="clue-number">{{ clue.number }}.</span>
                  <span class="clue-text">{{ clue.clue }}</span>
                  <mat-icon *ngIf="clue.isCompleted" class="completed-icon">check_circle</mat-icon>
                </div>
              </mat-list-item>
            </mat-list>
          </div>

          <div class="clues-section">
            <h3>
              <mat-icon>trending_down</mat-icon>
              Down
            </h3>
            <mat-list class="clues-list">
              <mat-list-item 
                *ngFor="let clue of downClues"
                [class.completed]="clue.isCompleted"
                [class.selected]="selectedClue()?.number === clue.number && selectedClue()?.direction === 'down'"
                (click)="selectClue(clue)"
              >
                <div class="clue-content">
                  <span class="clue-number">{{ clue.number }}.</span>
                  <span class="clue-text">{{ clue.clue }}</span>
                  <mat-icon *ngIf="clue.isCompleted" class="completed-icon">check_circle</mat-icon>
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </div>
      </div>

      <div class="game-actions" *ngIf="!gameCompleted()">
        <button mat-raised-button color="primary" (click)="checkAnswers()">
          <mat-icon>check</mat-icon>
          Check Answers
        </button>
        <button mat-button (click)="clearGrid()">
          <mat-icon>clear</mat-icon>
          Clear Grid
        </button>
        <button mat-button (click)="showHint()" [disabled]="hintsUsed() >= maxHints">
          <mat-icon>lightbulb</mat-icon>
          Hint ({{ hintsUsed() }}/{{ maxHints }})
        </button>
      </div>

      <div class="completion-message" *ngIf="gameCompleted()">
        <mat-card class="success-card">
          <mat-card-content>
            <mat-icon class="success-icon">emoji_events</mat-icon>
            <h2>Congratulations!</h2>
            <p>You've completed the crossword puzzle!</p>
            <p>Final Score: {{ score() }} points</p>
            <button mat-raised-button color="primary" (click)="startNewGame()">
              <mat-icon>refresh</mat-icon>
              New Puzzle
            </button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .crossword-game {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 16px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      
      h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: #333;
        
        mat-icon {
          color: #667eea;
        }
      }
      
      .score-info {
        display: flex;
        align-items: center;
        gap: 20px;
        
        .score {
          font-weight: 600;
          color: #667eea;
          font-size: 18px;
        }
        
        .progress {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 150px;
          
          span {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .game-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 24px;
    }

    .crossword-grid {
      display: flex;
      justify-content: center;
      
      .grid-container {
        border: 2px solid #333;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .grid-row {
        display: flex;
      }
      
      .grid-cell {
        width: 40px;
        height: 40px;
        border: 1px solid #ccc;
        position: relative;
        cursor: pointer;
        background: white;
        
        &.blocked {
          background: #333;
          cursor: not-allowed;
        }
        
        &.correct {
          background: #e8f5e8;
          border-color: #4caf50;
        }
        
        &.selected {
          background: #e3f2fd;
          border-color: #2196f3;
          box-shadow: inset 0 0 0 2px #2196f3;
        }
        
        .cell-number {
          position: absolute;
          top: 1px;
          left: 2px;
          font-size: 10px;
          font-weight: bold;
          color: #333;
          line-height: 1;
        }
        
        .cell-input {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          background: transparent;
          text-transform: uppercase;
          
          &:focus {
            background: #f0f8ff;
          }
        }
      }
    }

    .clues-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      .clues-section {
        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px 0;
          color: #333;
          font-size: 18px;
          
          mat-icon {
            color: #667eea;
          }
        }
        
        .clues-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          
          mat-list-item {
            cursor: pointer;
            transition: background-color 0.2s;
            
            &:hover {
              background-color: #f5f5f5;
            }
            
            &.completed {
              background-color: #e8f5e8;
              
              .clue-text {
                text-decoration: line-through;
                color: #666;
              }
            }
            
            &.selected {
              background-color: #e3f2fd;
              border-left: 4px solid #2196f3;
            }
            
            .clue-content {
              display: flex;
              align-items: center;
              gap: 8px;
              width: 100%;
              
              .clue-number {
                font-weight: bold;
                color: #667eea;
                min-width: 24px;
              }
              
              .clue-text {
                flex: 1;
                line-height: 1.4;
              }
              
              .completed-icon {
                color: #4caf50;
                font-size: 18px;
              }
            }
          }
        }
      }
    }

    .game-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      
      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .completion-message {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      
      .success-card {
        max-width: 400px;
        text-align: center;
        
        .success-icon {
          font-size: 64px;
          color: #ffc107;
          margin-bottom: 16px;
        }
        
        h2 {
          color: #4caf50;
          margin-bottom: 16px;
        }
        
        p {
          margin: 8px 0;
          font-size: 16px;
          
          &:last-of-type {
            font-weight: bold;
            color: #667eea;
            font-size: 18px;
          }
        }
        
        button {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }

    @media (max-width: 1024px) {
      .game-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .clues-panel {
        flex-direction: row;
        gap: 16px;
        
        .clues-section {
          flex: 1;
          
          .clues-list {
            max-height: 200px;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .crossword-game {
        padding: 12px;
      }
      
      .game-header {
        flex-direction: column;
        align-items: flex-start;
        
        .score-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }
      
      .grid-cell {
        width: 32px;
        height: 32px;
        
        .cell-input {
          font-size: 14px;
        }
      }
      
      .clues-panel {
        flex-direction: column;
        
        .clues-section .clues-list {
          max-height: 150px;
        }
      }
      
      .game-actions {
        flex-direction: column;
        align-items: center;
        
        button {
          width: 100%;
          max-width: 200px;
        }
      }
    }
  `]
})
export class CrosswordGameComponent implements OnInit {
  @Input() gameSession: GameSession | null = null;

  grid: CrosswordCell[][] = [];
  clues: CrosswordClue[] = [];
  selectedCell = signal<{row: number, col: number} | null>(null);
  selectedClue = signal<CrosswordClue | null>(null);
  score = signal(0);
  completedClues = signal(0);
  totalClues = signal(0);
  gameCompleted = signal(false);
  hintsUsed = signal(0);
  maxHints = 3;

  // Sample crossword data - in a real app, this would come from an API
  private readonly samplePuzzle = {
    grid: [
      [false, false, true,  false, false, false, true,  false, false],
      [false, false, true,  false, false, false, true,  false, false],
      [true,  true,  true,  true,  true,  true,  true,  true,  true ],
      [false, false, true,  false, false, false, true,  false, false],
      [false, false, true,  false, false, false, true,  false, false],
      [true,  true,  true,  true,  true,  true,  true,  true,  true ],
      [false, false, true,  false, false, false, false, false, false],
      [false, false, true,  false, false, false, false, false, false],
      [false, false, true,  false, false, false, false, false, false]
    ],
    clues: [
      { number: 1, clue: "Programming language created by Sun Microsystems", answer: "JAVA", direction: "across" as const, startRow: 2, startCol: 0 },
      { number: 2, clue: "Markup language for web pages", answer: "HTML", direction: "across" as const, startRow: 5, startCol: 0 },
      { number: 3, clue: "Object-oriented programming language", answer: "PYTHON", direction: "down" as const, startRow: 0, startCol: 2 },
      { number: 4, clue: "JavaScript runtime environment", answer: "NODE", direction: "down" as const, startRow: 2, startCol: 6 },
      { number: 5, clue: "Version control system", answer: "GIT", direction: "down" as const, startRow: 5, startCol: 4 }
    ]
  };

  get acrossClues(): CrosswordClue[] {
    return this.clues.filter(clue => clue.direction === 'across');
  }

  get downClues(): CrosswordClue[] {
    return this.clues.filter(clue => clue.direction === 'down');
  }

  progressPercentage(): number {
    return this.totalClues() > 0 ? (this.completedClues() / this.totalClues()) * 100 : 0;
  }

  ngOnInit() {
    this.initializeGame();
  }

  initializeGame() {
    this.createGrid();
    this.loadClues();
    this.totalClues.set(this.clues.length);
    this.score.set(0);
    this.completedClues.set(0);
    this.gameCompleted.set(false);
    this.hintsUsed.set(0);
  }

  createGrid() {
    const gridSize = 9;
    this.grid = [];
    
    for (let i = 0; i < gridSize; i++) {
      const row: CrosswordCell[] = [];
      for (let j = 0; j < gridSize; j++) {
        row.push({
          letter: '',
          isBlocked: !this.samplePuzzle.grid[i][j],
          userInput: '',
          isCorrect: false
        });
      }
      this.grid.push(row);
    }

    // Add numbers to grid
    this.samplePuzzle.clues.forEach(clue => {
      this.grid[clue.startRow][clue.startCol].number = clue.number;
    });
  }

  loadClues() {
    this.clues = this.samplePuzzle.clues.map(clue => ({
      ...clue,
      isCompleted: false
    }));
  }

  selectCell(row: number, col: number) {
    if (this.grid[row][col].isBlocked) return;
    
    this.selectedCell.set({ row, col });
    
    // Find clue that contains this cell
    const clue = this.findClueAtPosition(row, col);
    if (clue) {
      this.selectedClue.set(clue);
    }
  }

  selectClue(clue: CrosswordClue) {
    this.selectedClue.set(clue);
    this.selectedCell.set({ row: clue.startRow, col: clue.startCol });
  }

  findClueAtPosition(row: number, col: number): CrosswordClue | null {
    return this.clues.find(clue => {
      if (clue.direction === 'across') {
        return row === clue.startRow && 
               col >= clue.startCol && 
               col < clue.startCol + clue.answer.length;
      } else {
        return col === clue.startCol && 
               row >= clue.startRow && 
               row < clue.startRow + clue.answer.length;
      }
    }) || null;
  }

  onCellInput(row: number, col: number, event: any) {
    const value = event.target.value.toUpperCase();
    this.grid[row][col].userInput = value;
    
    // Move to next cell if input is valid
    if (value && this.selectedClue()) {
      this.moveToNextCell(row, col);
    }
    
    this.updateScore();
  }

  onKeyDown(event: KeyboardEvent, row: number, col: number) {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.moveCursor(row, col + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveCursor(row, col - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveCursor(row + 1, col);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveCursor(row - 1, col);
        break;
      case 'Backspace':
        if (!this.grid[row][col].userInput) {
          this.moveToPrevCell(row, col);
        }
        break;
    }
  }

  moveCursor(row: number, col: number) {
    if (row >= 0 && row < this.grid.length && 
        col >= 0 && col < this.grid[0].length && 
        !this.grid[row][col].isBlocked) {
      this.selectCell(row, col);
    }
  }

  moveToNextCell(row: number, col: number) {
    const clue = this.selectedClue();
    if (!clue) return;

    if (clue.direction === 'across' && col < clue.startCol + clue.answer.length - 1) {
      this.selectCell(row, col + 1);
    } else if (clue.direction === 'down' && row < clue.startRow + clue.answer.length - 1) {
      this.selectCell(row + 1, col);
    }
  }

  moveToPrevCell(row: number, col: number) {
    const clue = this.selectedClue();
    if (!clue) return;

    if (clue.direction === 'across' && col > clue.startCol) {
      this.selectCell(row, col - 1);
    } else if (clue.direction === 'down' && row > clue.startRow) {
      this.selectCell(row - 1, col);
    }
  }

  checkAnswers() {
    let correctAnswers = 0;
    
    this.clues.forEach(clue => {
      let userAnswer = '';
      
      for (let i = 0; i < clue.answer.length; i++) {
        if (clue.direction === 'across') {
          userAnswer += this.grid[clue.startRow][clue.startCol + i].userInput;
        } else {
          userAnswer += this.grid[clue.startRow + i][clue.startCol].userInput;
        }
      }
      
      const isCorrect = userAnswer === clue.answer;
      clue.isCompleted = isCorrect;
      
      if (isCorrect) {
        correctAnswers++;
        // Mark cells as correct
        for (let i = 0; i < clue.answer.length; i++) {
          if (clue.direction === 'across') {
            this.grid[clue.startRow][clue.startCol + i].isCorrect = true;
          } else {
            this.grid[clue.startRow + i][clue.startCol].isCorrect = true;
          }
        }
      }
    });
    
    this.completedClues.set(correctAnswers);
    
    if (correctAnswers === this.clues.length) {
      this.gameCompleted.set(true);
      this.score.set(this.score() + 500); // Bonus for completion
    }
  }

  updateScore() {
    let score = 0;
    this.clues.forEach(clue => {
      if (clue.isCompleted) {
        score += clue.answer.length * 10;
      }
    });
    
    // Deduct points for hints used
    score -= this.hintsUsed() * 25;
    
    this.score.set(Math.max(0, score));
  }

  clearGrid() {
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (!cell.isBlocked) {
          cell.userInput = '';
          cell.isCorrect = false;
        }
      });
    });
    
    this.clues.forEach(clue => {
      clue.isCompleted = false;
    });
    
    this.completedClues.set(0);
    this.score.set(0);
    this.gameCompleted.set(false);
  }

  showHint() {
    if (this.hintsUsed() >= this.maxHints) return;
    
    const incompleteClues = this.clues.filter(clue => !clue.isCompleted);
    if (incompleteClues.length === 0) return;
    
    const randomClue = incompleteClues[Math.floor(Math.random() * incompleteClues.length)];
    
    // Fill in the first empty letter of the clue
    for (let i = 0; i < randomClue.answer.length; i++) {
      let cellRow, cellCol;
      
      if (randomClue.direction === 'across') {
        cellRow = randomClue.startRow;
        cellCol = randomClue.startCol + i;
      } else {
        cellRow = randomClue.startRow + i;
        cellCol = randomClue.startCol;
      }
      
      if (!this.grid[cellRow][cellCol].userInput) {
        this.grid[cellRow][cellCol].userInput = randomClue.answer[i];
        this.hintsUsed.set(this.hintsUsed() + 1);
        break;
      }
    }
    
    this.updateScore();
  }

  startNewGame() {
    this.initializeGame();
  }
}
