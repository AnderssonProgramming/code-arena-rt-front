import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { GameSession } from '../../../../core/models/interfaces';

// Import sudoku generator (note: you may need to install types or use any)
declare const require: any;
const sudoku = require('sudoku-gen');

interface SudokuCell {
  value: number;
  isGiven: boolean;
  isValid: boolean;
  row: number;
  col: number;
}

@Component({
  selector: 'app-sudoku-game',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule
  ],
  template: `
    <div class="sudoku-container">
      <div class="sudoku-header">
        <h3>Sudoku Puzzle</h3>
        <div class="sudoku-info">
          <span class="difficulty">Difficulty: {{difficulty()}}</span>
          <span class="progress">{{completedCells()}}/81 cells</span>
        </div>
      </div>

      <div class="sudoku-grid">
        @for (row of sudokuGrid(); track $index; let rowIndex = $index) {
          <div class="sudoku-row" [class]="'row-' + rowIndex">
            @for (cell of row; track $index; let colIndex = $index) {
              <div 
                class="sudoku-cell"
                [class.given]="cell.isGiven"
                [class.invalid]="!cell.isValid"
                [class.completed]="cell.value > 0"
                [class.selected]="isSelected(rowIndex, colIndex)"
                [class]="getCellClasses(rowIndex, colIndex)"
                (click)="selectCell(rowIndex, colIndex)">
                
                @if (cell.isGiven || cell.value > 0) {
                  <span class="cell-value">{{cell.value}}</span>
                } @else {
                  <input 
                    type="text" 
                    class="cell-input"
                    maxlength="1"
                    [value]="cell.value || ''"
                    (input)="onCellInput($event, rowIndex, colIndex)"
                    (keydown)="onKeyDown($event, rowIndex, colIndex)">
                }
              </div>
            }
          </div>
        }
      </div>

      <div class="sudoku-controls">
        <div class="number-pad">
          @for (num of numbers; track num) {
            <button 
              mat-raised-button 
              class="number-button"
              [class.active]="selectedNumber() === num"
              (click)="selectNumber(num)">
              {{num}}
            </button>
          }
          <button 
            mat-raised-button 
            class="erase-button"
            (click)="eraseCell()">
            <mat-icon>backspace</mat-icon>
          </button>
        </div>

        <div class="game-actions">
          <button mat-button (click)="showHint()" [disabled]="hintsUsed() >= maxHints">
            <mat-icon>lightbulb</mat-icon>
            Hint ({{hintsUsed()}}/{{maxHints}})
          </button>
          
          <button mat-button (click)="resetPuzzle()">
            <mat-icon>refresh</mat-icon>
            Reset
          </button>
          
          <button mat-button (click)="checkSolution()">
            <mat-icon>check_circle</mat-icon>
            Check
          </button>
        </div>
      </div>

      @if (isCompleted()) {
        <div class="completion-message">
          <mat-card class="success-card">
            <mat-card-content>
              <div class="success-content">
                <mat-icon class="success-icon">celebration</mat-icon>
                <h3>Congratulations!</h3>
                <p>You solved the Sudoku puzzle!</p>
                <div class="stats">
                  <span>Time: {{formatTime(elapsedTime())}}</span>
                  <span>Hints used: {{hintsUsed()}}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .sudoku-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .sudoku-header {
      text-align: center;
      margin-bottom: 1.5rem;
      width: 100%;

      h3 {
        margin: 0 0 0.5rem 0;
        color: #1f2937;
        font-weight: 700;
      }

      .sudoku-info {
        display: flex;
        justify-content: space-between;
        color: #6b7280;
        font-size: 0.875rem;
      }
    }

    .sudoku-grid {
      display: grid;
      grid-template-rows: repeat(9, 1fr);
      gap: 2px;
      background: #374151;
      border: 3px solid #374151;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }

    .sudoku-row {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 2px;

      &.row-2, &.row-5 {
        margin-bottom: 2px;
      }
    }

    .sudoku-cell {
      width: 40px;
      height: 40px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: all 0.2s ease;

      &:nth-child(3n) {
        margin-right: 2px;
      }

      &.given {
        background: #f3f4f6;
        font-weight: bold;
        color: #1f2937;
      }

      &.completed:not(.given) {
        background: #dbeafe;
        color: #1d4ed8;
      }

      &.selected {
        background: #fbbf24 !important;
        box-shadow: 0 0 0 2px #f59e0b;
      }

      &.invalid {
        background: #fee2e2 !important;
        color: #dc2626;
      }

      &:hover:not(.given) {
        background: #f9fafb;
      }

      .cell-value {
        font-size: 1.25rem;
        font-weight: 600;
        user-select: none;
      }

      .cell-input {
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
        text-align: center;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1d4ed8;
        outline: none;

        &:focus {
          background: #fbbf24;
        }
      }
    }

    .sudoku-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    .number-pad {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;

      .number-button {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;

        &.active {
          background: #3b82f6;
          color: white;
        }
      }

      .erase-button {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: #ef4444;
        color: white;

        mat-icon {
          font-size: 1.2rem;
        }
      }
    }

    .game-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .completion-message {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;

      .success-card {
        background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
        border: 2px solid #10b981;

        .success-content {
          text-align: center;

          .success-icon {
            font-size: 3rem;
            color: #059669;
            margin-bottom: 1rem;
          }

          h3 {
            color: #1f2937;
            margin-bottom: 0.5rem;
          }

          p {
            color: #374151;
            margin-bottom: 1rem;
          }

          .stats {
            display: flex;
            gap: 1rem;
            justify-content: center;
            font-size: 0.875rem;
            color: #6b7280;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .sudoku-cell {
        width: 35px;
        height: 35px;

        .cell-value, .cell-input {
          font-size: 1rem;
        }
      }

      .number-button, .erase-button {
        width: 40px;
        height: 40px;
      }

      .game-actions {
        button {
          font-size: 0.875rem;
        }
      }
    }
  `]
})
export class SudokuGameComponent implements OnInit {
  @Input() gameSession: GameSession | null = null;

  // Reactive signals
  sudokuGrid = signal<SudokuCell[][]>([]);
  selectedRow = signal(-1);
  selectedCol = signal(-1);
  selectedNumber = signal(0);
  hintsUsed = signal(0);
  elapsedTime = signal(0);
  difficulty = signal('MEDIUM');
  
  // Configuration
  maxHints = 3;
  numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Computed values
  completedCells = computed(() => {
    return this.sudokuGrid().flat().filter(cell => cell.value > 0).length;
  });

  isCompleted = computed(() => {
    const grid = this.sudokuGrid();
    return grid.length > 0 && grid.every(row => 
      row.every(cell => cell.value > 0 && cell.isValid)
    );
  });

  private gameTimer?: number;
  private initialPuzzle: number[][] = [];

  ngOnInit(): void {
    this.generatePuzzle();
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  private generatePuzzle(): void {
    try {
      // Generate a new sudoku puzzle
      const puzzle = sudoku.generate(this.getDifficultyLevel());
      this.initialPuzzle = puzzle.map((row: number[]) => [...row]);
      
      // Convert to our cell format
      const grid: SudokuCell[][] = [];
      for (let row = 0; row < 9; row++) {
        const currentRow: SudokuCell[] = [];
        for (let col = 0; col < 9; col++) {
          currentRow.push({
            value: puzzle[row][col],
            isGiven: puzzle[row][col] > 0,
            isValid: true,
            row,
            col
          });
        }
        grid.push(currentRow);
      }
      
      this.sudokuGrid.set(grid);
    } catch (error) {
      console.error('Error generating sudoku:', error);
      // Fallback to a simple puzzle if library fails
      this.createFallbackPuzzle();
    }
  }

  private createFallbackPuzzle(): void {
    // Simple fallback puzzle
    const fallbackPuzzle = [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ];

    const grid: SudokuCell[][] = [];
    for (let row = 0; row < 9; row++) {
      const currentRow: SudokuCell[] = [];
      for (let col = 0; col < 9; col++) {
        currentRow.push({
          value: fallbackPuzzle[row][col],
          isGiven: fallbackPuzzle[row][col] > 0,
          isValid: true,
          row,
          col
        });
      }
      grid.push(currentRow);
    }
    
    this.sudokuGrid.set(grid);
    this.initialPuzzle = fallbackPuzzle.map(row => [...row]);
  }

  private getDifficultyLevel(): string {
    // Get difficulty from gameSession if available, otherwise use default
    const sessionDifficulty = this.gameSession?.settings?.difficulty;
    const difficulty = sessionDifficulty ?? this.difficulty();
    switch (difficulty) {
      case 'EASY': return 'easy';
      case 'HARD': return 'hard';
      default: return 'medium';
    }
  }

  private startTimer(): void {
    this.gameTimer = setInterval(() => {
      this.elapsedTime.update(time => time + 1);
    }, 1000) as any;
  }

  selectCell(row: number, col: number): void {
    const cell = this.sudokuGrid()[row][col];
    if (cell.isGiven) return;

    this.selectedRow.set(row);
    this.selectedCol.set(col);
  }

  isSelected(row: number, col: number): boolean {
    return this.selectedRow() === row && this.selectedCol() === col;
  }

  getCellClasses(row: number, col: number): string {
    let classes = '';
    
    // Add border classes for 3x3 boxes
    if (col % 3 === 2 && col < 8) classes += ' right-border';
    if (row % 3 === 2 && row < 8) classes += ' bottom-border';
    
    return classes;
  }

  selectNumber(num: number): void {
    this.selectedNumber.set(num);
    this.placeCellValue(num);
  }

  onCellInput(event: any, row: number, col: number): void {
    const value = parseInt(event.target.value) || 0;
    if (value >= 1 && value <= 9) {
      this.placeCellValue(value);
    } else {
      this.placeCellValue(0);
    }
  }

  onKeyDown(event: KeyboardEvent, row: number, col: number): void {
    const key = event.key;
    
    if (key >= '1' && key <= '9') {
      this.placeCellValue(parseInt(key));
      event.preventDefault();
    } else if (key === 'Backspace' || key === 'Delete') {
      this.placeCellValue(0);
      event.preventDefault();
    } else if (key === 'ArrowUp' && row > 0) {
      this.selectCell(row - 1, col);
      event.preventDefault();
    } else if (key === 'ArrowDown' && row < 8) {
      this.selectCell(row + 1, col);
      event.preventDefault();
    } else if (key === 'ArrowLeft' && col > 0) {
      this.selectCell(row, col - 1);
      event.preventDefault();
    } else if (key === 'ArrowRight' && col < 8) {
      this.selectCell(row, col + 1);
      event.preventDefault();
    }
  }

  private placeCellValue(value: number): void {
    const row = this.selectedRow();
    const col = this.selectedCol();
    
    if (row === -1 || col === -1) return;

    this.sudokuGrid.update(grid => {
      const newGrid = grid.map(r => r.map(c => ({ ...c })));
      if (!newGrid[row][col].isGiven) {
        newGrid[row][col].value = value;
        newGrid[row][col].isValid = this.isValidPlacement(newGrid, row, col, value);
      }
      return newGrid;
    });
  }

  private isValidPlacement(grid: SudokuCell[][], row: number, col: number, value: number): boolean {
    if (value === 0) return true;

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c].value === value) return false;
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col].value === value) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c].value === value) {
          return false;
        }
      }
    }

    return true;
  }

  eraseCell(): void {
    this.placeCellValue(0);
  }

  showHint(): void {
    if (this.hintsUsed() >= this.maxHints) return;

    // Find an empty cell and show the correct value
    const grid = this.sudokuGrid();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!grid[row][col].isGiven && grid[row][col].value === 0) {
          // Find the correct value for this cell
          for (let num = 1; num <= 9; num++) {
            if (this.isValidPlacement(grid, row, col, num)) {
              this.selectCell(row, col);
              this.placeCellValue(num);
              this.hintsUsed.update(hints => hints + 1);
              return;
            }
          }
        }
      }
    }
  }

  resetPuzzle(): void {
    this.sudokuGrid.update(grid => {
      const newGrid = grid.map(row => 
        row.map(cell => ({
          ...cell,
          value: cell.isGiven ? cell.value : 0,
          isValid: true
        }))
      );
      return newGrid;
    });
    
    this.selectedRow.set(-1);
    this.selectedCol.set(-1);
    this.hintsUsed.set(0);
    this.elapsedTime.set(0);
  }

  checkSolution(): void {
    let hasErrors = false;

    this.sudokuGrid.update(currentGrid => {
      const newGrid = currentGrid.map(row => 
        row.map(cell => {
          if (cell.value > 0) {
            const isValid = this.isValidPlacement(currentGrid, cell.row, cell.col, cell.value);
            if (!isValid) hasErrors = true;
            return { ...cell, isValid };
          }
          return cell;
        })
      );
      return newGrid;
    });

    if (!hasErrors && this.isCompleted()) {
      // Puzzle is completed correctly
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
        this.gameTimer = undefined;
      }
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
