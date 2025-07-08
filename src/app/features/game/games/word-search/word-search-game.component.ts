import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { GameSession } from '../../../../core/models/interfaces';

interface GridCell {
  letter: string;
  isPartOfWord: boolean;
  isFound: boolean;
  isSelected: boolean;
  wordId?: number;
}

interface WordToFind {
  id: number;
  word: string;
  found: boolean;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

@Component({
  selector: 'app-word-search-game',
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="word-search-game">
      <div class="game-header">
        <h2>
          <mat-icon>search</mat-icon>
          Word Search
        </h2>
        <div class="game-info">
          <div class="score">Score: {{ score() }}</div>
          <div class="timer">Time: {{ formatTime(timeElapsed()) }}</div>
          <div class="progress">
            <span>Found: {{ wordsFound() }}/{{ totalWords() }}</span>
            <mat-progress-bar 
              mode="determinate" 
              [value]="progressPercentage()">
            </mat-progress-bar>
          </div>
        </div>
      </div>

      <div class="game-content">
        <div class="grid-container">
          <div class="word-grid">
            <div 
              class="grid-row" 
              *ngFor="let row of grid; let i = index"
            >
              <div 
                class="grid-cell"
                *ngFor="let cell of row; let j = index"
                [class.found]="cell.isFound"
                [class.selected]="cell.isSelected"
                [class.highlight]="isHighlighted(i, j)"
                (mousedown)="onMouseDown(i, j)"
                (mouseenter)="onMouseEnter(i, j)"
                (mouseup)="onMouseUp()"
              >
                {{ cell.letter }}
              </div>
            </div>
          </div>
        </div>

        <div class="words-panel">
          <h3>
            <mat-icon>list</mat-icon>
            Words to Find
          </h3>
          
          <div class="words-grid">
            <mat-chip-set>
              <mat-chip 
                *ngFor="let word of words"
                [class.found]="word.found"
                [disabled]="word.found"
              >
                <span [class.crossed-out]="word.found">{{ word.word }}</span>
                <mat-icon *ngIf="word.found" class="found-icon">check</mat-icon>
              </mat-chip>
            </mat-chip-set>
          </div>

          <div class="game-stats">
            <div class="stat">
              <mat-icon>timer</mat-icon>
              <span>Best Time: {{ bestTime() ? formatTime(bestTime()) : '--:--' }}</span>
            </div>
            <div class="stat">
              <mat-icon>emoji_events</mat-icon>
              <span>High Score: {{ highScore() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="game-actions" *ngIf="!gameCompleted()">
        <button mat-raised-button color="primary" (click)="newGame()">
          <mat-icon>refresh</mat-icon>
          New Game
        </button>
        <button mat-button (click)="showHint()" [disabled]="hintsUsed() >= maxHints">
          <mat-icon>lightbulb</mat-icon>
          Hint ({{ hintsUsed() }}/{{ maxHints }})
        </button>
        <button mat-button (click)="pauseGame()" *ngIf="!isPaused()">
          <mat-icon>pause</mat-icon>
          Pause
        </button>
        <button mat-button (click)="resumeGame()" *ngIf="isPaused()">
          <mat-icon>play_arrow</mat-icon>
          Resume
        </button>
      </div>

      <div class="completion-overlay" *ngIf="gameCompleted()">
        <mat-card class="completion-card">
          <mat-card-content>
            <mat-icon class="trophy-icon">emoji_events</mat-icon>
            <h2>Puzzle Solved!</h2>
            <div class="final-stats">
              <div class="stat-item">
                <span class="label">Time:</span>
                <span class="value">{{ formatTime(timeElapsed()) }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Score:</span>
                <span class="value">{{ score() }} points</span>
              </div>
              <div class="stat-item">
                <span class="label">Hints Used:</span>
                <span class="value">{{ hintsUsed() }}/{{ maxHints }}</span>
              </div>
            </div>
            <div class="completion-actions">
              <button mat-raised-button color="primary" (click)="newGame()">
                <mat-icon>refresh</mat-icon>
                Play Again
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .word-search-game {
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
      
      .game-info {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
        
        .score, .timer {
          font-weight: 600;
          color: #667eea;
          font-size: 16px;
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
      grid-template-columns: 1fr 300px;
      gap: 24px;
    }

    .grid-container {
      display: flex;
      justify-content: center;
      
      .word-grid {
        display: inline-block;
        border: 2px solid #333;
        background: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        user-select: none;
      }
      
      .grid-row {
        display: flex;
      }
      
      .grid-cell {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #e0e0e0;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s ease;
        background: white;
        
        &:hover {
          background: #f0f8ff;
        }
        
        &.selected {
          background: #2196f3;
          color: white;
        }
        
        &.highlight {
          background: #ffeb3b;
        }
        
        &.found {
          background: #4caf50;
          color: white;
          
          &::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            background: white;
            top: 50%;
            left: 0;
          }
        }
      }
    }

    .words-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
      
      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: #333;
        font-size: 18px;
        
        mat-icon {
          color: #667eea;
        }
      }
      
      .words-grid {
        mat-chip-set {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        mat-chip {
          transition: all 0.3s ease;
          
          &.found {
            background: #4caf50 !important;
            color: white !important;
          }
          
          .crossed-out {
            text-decoration: line-through;
          }
          
          .found-icon {
            font-size: 16px;
            margin-left: 4px;
          }
        }
      }
      
      .game-stats {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 16px;
        background: #f5f5f5;
        border-radius: 8px;
        
        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          
          mat-icon {
            color: #667eea;
            font-size: 18px;
          }
          
          span {
            font-size: 14px;
            color: #666;
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

    .completion-overlay {
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
      
      .completion-card {
        max-width: 400px;
        text-align: center;
        
        .trophy-icon {
          font-size: 64px;
          color: #ffc107;
          margin-bottom: 16px;
        }
        
        h2 {
          color: #4caf50;
          margin-bottom: 20px;
        }
        
        .final-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
          
          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
            
            .label {
              font-weight: 500;
              color: #666;
            }
            
            .value {
              font-weight: bold;
              color: #333;
            }
          }
        }
        
        .completion-actions {
          button {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 auto;
          }
        }
      }
    }

    @media (max-width: 1024px) {
      .game-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .words-panel {
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .word-search-game {
        padding: 12px;
      }
      
      .game-header {
        flex-direction: column;
        align-items: flex-start;
        
        .game-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }
      
      .grid-cell {
        width: 32px;
        height: 32px;
        font-size: 14px;
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

    @media (max-width: 480px) {
      .grid-cell {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }
      
      .words-panel .words-grid mat-chip-set {
        justify-content: center;
      }
    }
  `]
})
export class WordSearchGameComponent implements OnInit {
  @Input() gameSession: GameSession | null = null;

  grid: GridCell[][] = [];
  words: WordToFind[] = [];
  currentSelection: Selection | null = null;
  isSelecting = false;
  
  score = signal(0);
  timeElapsed = signal(0);
  wordsFound = signal(0);
  totalWords = signal(0);
  gameCompleted = signal(false);
  isPaused = signal(false);
  hintsUsed = signal(0);
  maxHints = 3;
  bestTime = signal(0);
  highScore = signal(0);

  private gameTimer: any;
  private readonly gridSize = 15;
  
  // Sample words for the puzzle
  private readonly sampleWords = [
    'ANGULAR', 'TYPESCRIPT', 'JAVASCRIPT', 'HTML', 'CSS',
    'COMPONENT', 'SERVICE', 'REACTIVE', 'OBSERVABLE', 'PIPE',
    'ROUTING', 'MODULE', 'DIRECTIVE', 'TESTING', 'DEPLOY'
  ];

  progressPercentage(): number {
    return this.totalWords() > 0 ? (this.wordsFound() / this.totalWords()) * 100 : 0;
  }

  ngOnInit() {
    this.loadBestScores();
    this.newGame();
  }

  ngOnDestroy() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  newGame() {
    this.initializeGrid();
    this.selectRandomWords();
    this.placeWordsInGrid();
    this.fillEmptySpaces();
    this.resetGameState();
    this.startTimer();
  }

  initializeGrid() {
    this.grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      const row: GridCell[] = [];
      for (let j = 0; j < this.gridSize; j++) {
        row.push({
          letter: '',
          isPartOfWord: false,
          isFound: false,
          isSelected: false
        });
      }
      this.grid.push(row);
    }
  }

  selectRandomWords() {
    const shuffled = [...this.sampleWords].sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, 8); // Select 8 random words
    
    this.words = selectedWords.map((word, index) => ({
      id: index,
      word: word,
      found: false,
      direction: 'horizontal',
      startRow: 0,
      startCol: 0,
      endRow: 0,
      endCol: 0
    }));
    
    this.totalWords.set(this.words.length);
  }

  placeWordsInGrid() {
    const directions = ['horizontal', 'vertical', 'diagonal'] as const;
    
    this.words.forEach(wordObj => {
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const word = wordObj.word;
        
        let startRow, startCol, endRow, endCol;
        
        switch (direction) {
          case 'horizontal':
            startRow = Math.floor(Math.random() * this.gridSize);
            startCol = Math.floor(Math.random() * (this.gridSize - word.length + 1));
            endRow = startRow;
            endCol = startCol + word.length - 1;
            break;
          case 'vertical':
            startRow = Math.floor(Math.random() * (this.gridSize - word.length + 1));
            startCol = Math.floor(Math.random() * this.gridSize);
            endRow = startRow + word.length - 1;
            endCol = startCol;
            break;
          case 'diagonal':
            startRow = Math.floor(Math.random() * (this.gridSize - word.length + 1));
            startCol = Math.floor(Math.random() * (this.gridSize - word.length + 1));
            endRow = startRow + word.length - 1;
            endCol = startCol + word.length - 1;
            break;
        }
        
        if (this.canPlaceWord(word, startRow, startCol, direction)) {
          this.placeWord(word, startRow, startCol, direction, wordObj.id);
          wordObj.direction = direction;
          wordObj.startRow = startRow;
          wordObj.startCol = startCol;
          wordObj.endRow = endRow;
          wordObj.endCol = endCol;
          placed = true;
        }
        
        attempts++;
      }
    });
  }

  canPlaceWord(word: string, startRow: number, startCol: number, direction: string): boolean {
    for (let i = 0; i < word.length; i++) {
      let row = startRow;
      let col = startCol;
      
      switch (direction) {
        case 'horizontal':
          col += i;
          break;
        case 'vertical':
          row += i;
          break;
        case 'diagonal':
          row += i;
          col += i;
          break;
      }
      
      if (row >= this.gridSize || col >= this.gridSize) {
        return false;
      }
      
      const cell = this.grid[row][col];
      if (cell.letter !== '' && cell.letter !== word[i]) {
        return false;
      }
    }
    return true;
  }

  placeWord(word: string, startRow: number, startCol: number, direction: string, wordId: number) {
    for (let i = 0; i < word.length; i++) {
      let row = startRow;
      let col = startCol;
      
      switch (direction) {
        case 'horizontal':
          col += i;
          break;
        case 'vertical':
          row += i;
          break;
        case 'diagonal':
          row += i;
          col += i;
          break;
      }
      
      this.grid[row][col].letter = word[i];
      this.grid[row][col].isPartOfWord = true;
      this.grid[row][col].wordId = wordId;
    }
  }

  fillEmptySpaces() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (this.grid[i][j].letter === '') {
          this.grid[i][j].letter = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  }

  resetGameState() {
    this.score.set(0);
    this.timeElapsed.set(0);
    this.wordsFound.set(0);
    this.gameCompleted.set(false);
    this.isPaused.set(false);
    this.hintsUsed.set(0);
    this.currentSelection = null;
    this.isSelecting = false;
  }

  startTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    
    this.gameTimer = setInterval(() => {
      if (!this.isPaused() && !this.gameCompleted()) {
        this.timeElapsed.set(this.timeElapsed() + 1);
      }
    }, 1000);
  }

  onMouseDown(row: number, col: number) {
    this.isSelecting = true;
    this.currentSelection = { startRow: row, startCol: col, endRow: row, endCol: col };
    this.clearSelection();
    this.grid[row][col].isSelected = true;
  }

  onMouseEnter(row: number, col: number) {
    if (this.isSelecting && this.currentSelection) {
      this.currentSelection.endRow = row;
      this.currentSelection.endCol = col;
      this.updateSelection();
    }
  }

  onMouseUp() {
    if (this.isSelecting && this.currentSelection) {
      this.checkWordSelection();
      this.isSelecting = false;
    }
  }

  clearSelection() {
    this.grid.forEach(row => {
      row.forEach(cell => {
        cell.isSelected = false;
      });
    });
  }

  updateSelection() {
    this.clearSelection();
    if (!this.currentSelection) return;
    
    const cells = this.getSelectionCells();
    cells.forEach(({ row, col }) => {
      this.grid[row][col].isSelected = true;
    });
  }

  getSelectionCells(): { row: number, col: number }[] {
    if (!this.currentSelection) return [];
    
    const { startRow, startCol, endRow, endCol } = this.currentSelection;
    const cells: { row: number, col: number }[] = [];
    
    const rowDiff = endRow - startRow;
    const colDiff = endCol - startCol;
    const length = Math.max(Math.abs(rowDiff), Math.abs(colDiff)) + 1;
    
    // Check if it's a valid direction (horizontal, vertical, or diagonal)
    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
      const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
      const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);
      
      for (let i = 0; i < length; i++) {
        const row = startRow + (rowStep * i);
        const col = startCol + (colStep * i);
        cells.push({ row, col });
      }
    }
    
    return cells;
  }

  isHighlighted(row: number, col: number): boolean {
    if (!this.isSelecting || !this.currentSelection) return false;
    return this.getSelectionCells().some(cell => cell.row === row && cell.col === col);
  }

  checkWordSelection() {
    if (!this.currentSelection) return;
    
    const selectedCells = this.getSelectionCells();
    const selectedWord = selectedCells.map(({ row, col }) => this.grid[row][col].letter).join('');
    const reverseWord = selectedWord.split('').reverse().join('');
    
    const foundWord = this.words.find(word => 
      !word.found && (word.word === selectedWord || word.word === reverseWord)
    );
    
    if (foundWord) {
      foundWord.found = true;
      selectedCells.forEach(({ row, col }) => {
        this.grid[row][col].isFound = true;
      });
      
      this.wordsFound.set(this.wordsFound() + 1);
      this.updateScore(foundWord.word.length);
      
      if (this.wordsFound() === this.totalWords()) {
        this.completeGame();
      }
    }
    
    this.clearSelection();
    this.currentSelection = null;
  }

  updateScore(wordLength: number) {
    const basePoints = wordLength * 10;
    const timeBonus = Math.max(0, 300 - this.timeElapsed());
    const hintPenalty = this.hintsUsed() * 25;
    
    this.score.set(this.score() + basePoints + timeBonus - hintPenalty);
  }

  showHint() {
    if (this.hintsUsed() >= this.maxHints) return;
    
    const unFoundWords = this.words.filter(word => !word.found);
    if (unFoundWords.length === 0) return;
    
    const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
    
    // Highlight the first letter of the word for 3 seconds
    const { startRow, startCol } = randomWord;
    this.grid[startRow][startCol].isSelected = true;
    
    setTimeout(() => {
      this.grid[startRow][startCol].isSelected = false;
    }, 3000);
    
    this.hintsUsed.set(this.hintsUsed() + 1);
  }

  pauseGame() {
    this.isPaused.set(true);
  }

  resumeGame() {
    this.isPaused.set(false);
  }

  completeGame() {
    this.gameCompleted.set(true);
    
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    
    this.saveBestScores();
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  loadBestScores() {
    const bestTime = localStorage.getItem('wordSearchBestTime');
    const highScore = localStorage.getItem('wordSearchHighScore');
    
    if (bestTime) {
      this.bestTime.set(parseInt(bestTime));
    }
    
    if (highScore) {
      this.highScore.set(parseInt(highScore));
    }
  }

  saveBestScores() {
    const currentTime = this.timeElapsed();
    const currentScore = this.score();
    
    if (this.bestTime() === 0 || currentTime < this.bestTime()) {
      this.bestTime.set(currentTime);
      localStorage.setItem('wordSearchBestTime', currentTime.toString());
    }
    
    if (currentScore > this.highScore()) {
      this.highScore.set(currentScore);
      localStorage.setItem('wordSearchHighScore', currentScore.toString());
    }
  }
}
