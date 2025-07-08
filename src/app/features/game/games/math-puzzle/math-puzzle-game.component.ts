import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { GameSession } from '../../../../core/models/interfaces';

type Difficulty = 'easy' | 'medium' | 'hard';
type ProblemType = 'arithmetic' | 'algebra' | 'geometry';

interface MathProblem {
  id: number;
  question: string;
  answer: number;
  userAnswer: string;
  isCorrect: boolean | null;
  difficulty: Difficulty;
  points: number;
  type: ProblemType;
}

@Component({
  selector: 'app-math-puzzle-game',
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule
  ],
  template: `
    <div class="math-puzzle-game">
      <div class="game-header">
        <h2>
          <mat-icon>calculate</mat-icon>
          Math Puzzle Challenge
        </h2>
        <div class="game-info">
          <div class="score">Score: {{ score() }}</div>
          <div class="streak">Streak: {{ streak() }}</div>
          <div class="timer">Time: {{ formatTime(timeElapsed()) }}</div>
          <div class="progress">
            <span>Problem {{ currentProblemIndex() + 1 }}/{{ totalProblems() }}</span>
            <mat-progress-bar 
              mode="determinate" 
              [value]="progressPercentage()">
            </mat-progress-bar>
          </div>
        </div>
      </div>

      <div class="game-content" *ngIf="!gameCompleted()">
        <div class="difficulty-selector" *ngIf="currentProblemIndex() === 0 && !gameStarted()">
          <h3>Choose Difficulty</h3>
          <div class="difficulty-options">
            <button 
              mat-raised-button 
              [color]="selectedDifficulty() === 'easy' ? 'primary' : ''" 
              (click)="selectDifficulty('easy')"
            >
              <mat-icon>sentiment_satisfied</mat-icon>
              Easy
            </button>
            <button 
              mat-raised-button 
              [color]="selectedDifficulty() === 'medium' ? 'primary' : ''" 
              (click)="selectDifficulty('medium')"
            >
              <mat-icon>sentiment_neutral</mat-icon>
              Medium
            </button>
            <button 
              mat-raised-button 
              [color]="selectedDifficulty() === 'hard' ? 'primary' : ''" 
              (click)="selectDifficulty('hard')"
            >
              <mat-icon>sentiment_dissatisfied</mat-icon>
              Hard
            </button>
          </div>
          <button 
            mat-raised-button 
            color="accent" 
            (click)="startGame()"
            [disabled]="!selectedDifficulty()"
            class="start-button"
          >
            <mat-icon>play_arrow</mat-icon>
            Start Game
          </button>
        </div>

        <div class="problem-section" *ngIf="gameStarted() && currentProblem()">
          <mat-card class="problem-card">
            <mat-card-header>
              <mat-card-title>
                <div class="problem-info">
                  <span class="problem-type">{{ getProblemTypeLabel(currentProblem()!.type) }}</span>
                  <span class="difficulty-badge" [class]="currentProblem()!.difficulty">
                    {{ currentProblem()!.difficulty.toUpperCase() }}
                  </span>
                </div>
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="problem-display">
                <div class="question" [innerHTML]="currentProblem()!.question"></div>
                
                <div class="answer-section">
                  <mat-form-field appearance="outline" class="answer-input">
                    <mat-label>Your Answer</mat-label>
                    <input 
                      matInput 
                      type="number" 
                      [(ngModel)]="currentProblem()!.userAnswer"
                      (keydown.enter)="submitAnswer()"
                      [disabled]="currentProblem()!.isCorrect !== null"
                      placeholder="Enter your answer"
                      #answerInput
                    >
                  </mat-form-field>
                  
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="submitAnswer()"
                    [disabled]="!currentProblem()!.userAnswer || currentProblem()!.isCorrect !== null"
                    class="submit-button"
                  >
                    <mat-icon>check</mat-icon>
                    Submit
                  </button>
                </div>
                
                <div class="feedback" *ngIf="currentProblem()!.isCorrect !== null">
                  <div class="result" [class.correct]="currentProblem()!.isCorrect" [class.incorrect]="!currentProblem()!.isCorrect">
                    <mat-icon>{{ currentProblem()!.isCorrect ? 'check_circle' : 'cancel' }}</mat-icon>
                    <span>{{ currentProblem()!.isCorrect ? 'Correct!' : 'Incorrect' }}</span>
                  </div>
                  <div class="correct-answer" *ngIf="!currentProblem()!.isCorrect">
                    Correct answer: {{ currentProblem()!.answer }}
                  </div>
                  <div class="points-earned" *ngIf="currentProblem()!.isCorrect">
                    +{{ currentProblem()!.points }} points
                  </div>
                </div>
              </div>
            </mat-card-content>
            
            <mat-card-actions>
              <button 
                mat-raised-button 
                color="accent" 
                (click)="nextProblem()"
                *ngIf="currentProblem()!.isCorrect !== null"
              >
                <mat-icon>arrow_forward</mat-icon>
                {{ currentProblemIndex() === totalProblems() - 1 ? 'Finish' : 'Next Problem' }}
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <div class="game-actions" *ngIf="gameStarted() && !gameCompleted()">
        <button mat-button (click)="showHint()" [disabled]="hintsUsed() >= maxHints || currentProblem()?.isCorrect !== null">
          <mat-icon>lightbulb</mat-icon>
          Hint ({{ hintsUsed() }}/{{ maxHints }})
        </button>
        <button mat-button (click)="skipProblem()" [disabled]="skipsUsed() >= maxSkips || currentProblem()?.isCorrect !== null">
          <mat-icon>skip_next</mat-icon>
          Skip ({{ skipsUsed() }}/{{ maxSkips }})
        </button>
      </div>

      <div class="completion-section" *ngIf="gameCompleted()">
        <mat-card class="completion-card">
          <mat-card-content>
            <div class="completion-content">
              <mat-icon class="trophy-icon">emoji_events</mat-icon>
              <h2>Game Complete!</h2>
              
              <div class="final-stats">
                <div class="stat-row">
                  <span class="label">Final Score:</span>
                  <span class="value">{{ score() }} points</span>
                </div>
                <div class="stat-row">
                  <span class="label">Time:</span>
                  <span class="value">{{ formatTime(timeElapsed()) }}</span>
                </div>
                <div class="stat-row">
                  <span class="label">Correct Answers:</span>
                  <span class="value">{{ correctAnswers() }}/{{ totalProblems() }}</span>
                </div>
                <div class="stat-row">
                  <span class="label">Best Streak:</span>
                  <span class="value">{{ bestStreak() }}</span>
                </div>
                <div class="stat-row">
                  <span class="label">Accuracy:</span>
                  <span class="value">{{ getAccuracy() }}%</span>
                </div>
              </div>
              
              <div class="grade-section">
                <div class="grade" [class]="getGradeClass()">
                  {{ getGrade() }}
                </div>
                <div class="grade-description">
                  {{ getGradeDescription() }}
                </div>
              </div>
              
              <div class="completion-actions">
                <button mat-raised-button color="primary" (click)="playAgain()">
                  <mat-icon>refresh</mat-icon>
                  Play Again
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="hint-overlay" *ngIf="showingHint()">
        <mat-card class="hint-card">
          <mat-card-content>
            <h3>
              <mat-icon>lightbulb</mat-icon>
              Hint
            </h3>
            <p>{{ currentHint() }}</p>
            <button mat-button (click)="closeHint()">Got it!</button>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .math-puzzle-game {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 16px;
      max-width: 800px;
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
        
        .score, .streak, .timer {
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

    .difficulty-selector {
      text-align: center;
      padding: 40px 20px;
      
      h3 {
        margin-bottom: 24px;
        color: #333;
      }
      
      .difficulty-options {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-bottom: 32px;
        flex-wrap: wrap;
        
        button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          min-width: 120px;
          
          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }
      }
      
      .start-button {
        font-size: 18px;
        padding: 12px 32px;
        
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .problem-section {
      .problem-card {
        max-width: 600px;
        margin: 0 auto;
        
        .problem-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          
          .problem-type {
            font-size: 16px;
            color: #666;
          }
          
          .difficulty-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            
            &.easy {
              background: #e8f5e8;
              color: #4caf50;
            }
            
            &.medium {
              background: #fff3e0;
              color: #ff9800;
            }
            
            &.hard {
              background: #ffebee;
              color: #f44336;
            }
          }
        }
        
        .problem-display {
          .question {
            font-size: 24px;
            text-align: center;
            margin: 24px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          
          .answer-section {
            display: flex;
            gap: 16px;
            align-items: flex-end;
            margin: 24px 0;
            
            .answer-input {
              flex: 1;
              max-width: 200px;
            }
            
            .submit-button {
              height: 56px;
              padding: 0 24px;
            }
          }
          
          .feedback {
            margin-top: 20px;
            text-align: center;
            
            .result {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 12px;
              
              &.correct {
                color: #4caf50;
              }
              
              &.incorrect {
                color: #f44336;
              }
              
              mat-icon {
                font-size: 24px;
              }
            }
            
            .correct-answer {
              color: #666;
              margin-bottom: 8px;
            }
            
            .points-earned {
              color: #4caf50;
              font-weight: bold;
              font-size: 16px;
            }
          }
        }
      }
    }

    .game-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      
      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .completion-section {
      .completion-card {
        max-width: 500px;
        margin: 0 auto;
        
        .completion-content {
          text-align: center;
          
          .trophy-icon {
            font-size: 64px;
            color: #ffc107;
            margin-bottom: 16px;
          }
          
          h2 {
            color: #4caf50;
            margin-bottom: 24px;
          }
          
          .final-stats {
            margin-bottom: 24px;
            
            .stat-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #e0e0e0;
              
              .label {
                color: #666;
              }
              
              .value {
                font-weight: bold;
                color: #333;
              }
            }
          }
          
          .grade-section {
            margin: 24px 0;
            
            .grade {
              font-size: 48px;
              font-weight: bold;
              margin-bottom: 8px;
              
              &.grade-a {
                color: #4caf50;
              }
              
              &.grade-b {
                color: #8bc34a;
              }
              
              &.grade-c {
                color: #ff9800;
              }
              
              &.grade-d {
                color: #ff5722;
              }
              
              &.grade-f {
                color: #f44336;
              }
            }
            
            .grade-description {
              color: #666;
              font-style: italic;
            }
          }
          
          .completion-actions {
            button {
              display: flex;
              align-items: center;
              gap: 8px;
              margin: 0 auto;
              padding: 12px 24px;
              font-size: 16px;
            }
          }
        }
      }
    }

    .hint-overlay {
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
      
      .hint-card {
        max-width: 400px;
        margin: 20px;
        
        h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          
          mat-icon {
            color: #ffc107;
          }
        }
        
        p {
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        button {
          display: block;
          margin: 0 auto;
        }
      }
    }

    @media (max-width: 768px) {
      .math-puzzle-game {
        padding: 12px;
      }
      
      .game-header {
        flex-direction: column;
        align-items: flex-start;
        
        .game-info {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          width: 100%;
        }
      }
      
      .difficulty-selector .difficulty-options {
        flex-direction: column;
        
        button {
          width: 100%;
          max-width: 200px;
        }
      }
      
      .problem-section .problem-card .problem-display {
        .question {
          font-size: 20px;
          padding: 16px;
        }
        
        .answer-section {
          flex-direction: column;
          align-items: stretch;
          
          .submit-button {
            height: 48px;
            width: 100%;
          }
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
export class MathPuzzleGameComponent implements OnInit {
  @Input() gameSession: GameSession | null = null;

  problems: MathProblem[] = [];
  currentProblemIndex = signal(0);
  score = signal(0);
  timeElapsed = signal(0);
  gameStarted = signal(false);
  gameCompleted = signal(false);
  selectedDifficulty = signal<Difficulty | null>(null);
  streak = signal(0);
  bestStreak = signal(0);
  correctAnswers = signal(0);
  hintsUsed = signal(0);
  skipsUsed = signal(0);
  showingHint = signal(false);
  currentHint = signal('');
  
  maxHints = 3;
  maxSkips = 2;
  private gameTimer: any;

  totalProblems(): number {
    return this.problems.length;
  }

  currentProblem(): MathProblem | null {
    return this.problems[this.currentProblemIndex()] || null;
  }

  progressPercentage(): number {
    return this.totalProblems() > 0 ? ((this.currentProblemIndex() + 1) / this.totalProblems()) * 100 : 0;
  }

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  selectDifficulty(difficulty: Difficulty) {
    this.selectedDifficulty.set(difficulty);
  }

  startGame() {
    if (!this.selectedDifficulty()) return;
    
    this.generateProblems();
    this.gameStarted.set(true);
    this.startTimer();
  }

  generateProblems() {
    const difficulty = this.selectedDifficulty()!;
    const problemCount = 10;
    this.problems = [];

    for (let i = 0; i < problemCount; i++) {
      this.problems.push(this.generateProblem(i, difficulty));
    }
  }

  generateProblem(id: number, difficulty: Difficulty): MathProblem {
    const types: ProblemType[] = ['arithmetic', 'algebra'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let problem: MathProblem;
    
    switch (type) {
      case 'arithmetic':
        problem = this.generateArithmeticProblem(id, difficulty);
        break;
      case 'algebra':
        problem = this.generateAlgebraProblem(id, difficulty);
        break;
      default:
        problem = this.generateArithmeticProblem(id, difficulty);
    }
    
    return problem;
  }

  generateArithmeticProblem(id: number, difficulty: Difficulty): MathProblem {
    let question: string;
    let answer: number;
    let points: number;
    
    switch (difficulty) {
      case 'easy':
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const operation = ['+', '-', '×'][Math.floor(Math.random() * 3)];
        
        switch (operation) {
          case '+':
            question = `${a} + ${b} = ?`;
            answer = a + b;
            break;
          case '-':
            const larger = Math.max(a, b);
            const smaller = Math.min(a, b);
            question = `${larger} - ${smaller} = ?`;
            answer = larger - smaller;
            break;
          case '×':
            const x = Math.floor(Math.random() * 10) + 1;
            const y = Math.floor(Math.random() * 10) + 1;
            question = `${x} × ${y} = ?`;
            answer = x * y;
            break;
          default:
            question = `${a} + ${b} = ?`;
            answer = a + b;
        }
        points = 10;
        break;
        
      case 'medium':
        const c = Math.floor(Math.random() * 50) + 10;
        const d = Math.floor(Math.random() * 50) + 10;
        const op = ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];
        
        switch (op) {
          case '+':
            question = `${c} + ${d} = ?`;
            answer = c + d;
            break;
          case '-':
            question = `${Math.max(c, d)} - ${Math.min(c, d)} = ?`;
            answer = Math.max(c, d) - Math.min(c, d);
            break;
          case '×':
            const m = Math.floor(Math.random() * 15) + 5;
            const n = Math.floor(Math.random() * 15) + 5;
            question = `${m} × ${n} = ?`;
            answer = m * n;
            break;
          case '÷':
            const divisor = Math.floor(Math.random() * 10) + 2;
            const dividend = divisor * (Math.floor(Math.random() * 20) + 1);
            question = `${dividend} ÷ ${divisor} = ?`;
            answer = dividend / divisor;
            break;
          default:
            question = `${c} + ${d} = ?`;
            answer = c + d;
        }
        points = 20;
        break;
        
      case 'hard':
        // Complex arithmetic with multiple operations
        const e = Math.floor(Math.random() * 20) + 5;
        const f = Math.floor(Math.random() * 20) + 5;
        const g = Math.floor(Math.random() * 10) + 2;
        
        const complexity = Math.floor(Math.random() * 3);
        switch (complexity) {
          case 0:
            question = `(${e} + ${f}) × ${g} = ?`;
            answer = (e + f) * g;
            break;
          case 1:
            question = `${e} × ${f} - ${g * 10} = ?`;
            answer = e * f - (g * 10);
            break;
          case 2:
            const h = Math.floor(Math.random() * 5) + 2;
            question = `${e}² + ${f} = ?`;
            answer = (e * e) + f;
            break;
          default:
            question = `${e} + ${f} × ${g} = ?`;
            answer = e + (f * g);
        }
        points = 30;
        break;
        
      default:
        question = '2 + 2 = ?';
        answer = 4;
        points = 10;
    }
    
    return {
      id,
      question,
      answer,
      userAnswer: '',
      isCorrect: null,
      difficulty,
      points,
      type: 'arithmetic'
    };
  }

  generateAlgebraProblem(id: number, difficulty: Difficulty): MathProblem {
    let question: string;
    let answer: number;
    let points: number;
    
    switch (difficulty) {
      case 'easy':
        const x = Math.floor(Math.random() * 10) + 1;
        const constant = Math.floor(Math.random() * 20) + 1;
        question = `If x = ${x}, what is x + ${constant}?`;
        answer = x + constant;
        points = 15;
        break;
        
      case 'medium':
        const a = Math.floor(Math.random() * 5) + 2;
        const b = Math.floor(Math.random() * 20) + 5;
        const solution = Math.floor(Math.random() * 10) + 1;
        const result = a * solution + b;
        question = `Solve for x: ${a}x + ${b} = ${result}`;
        answer = solution;
        points = 25;
        break;
        
      case 'hard':
        const coeff = Math.floor(Math.random() * 3) + 2;
        const term = Math.floor(Math.random() * 15) + 5;
        const sol = Math.floor(Math.random() * 8) + 1;
        const res = coeff * sol - term;
        question = `Solve for x: ${coeff}x - ${term} = ${res}`;
        answer = sol;
        points = 35;
        break;
        
      default:
        question = 'If x = 3, what is x + 2?';
        answer = 5;
        points = 15;
    }
    
    return {
      id,
      question,
      answer,
      userAnswer: '',
      isCorrect: null,
      difficulty,
      points,
      type: 'algebra'
    };
  }

  startTimer() {
    this.gameTimer = setInterval(() => {
      if (!this.gameCompleted()) {
        this.timeElapsed.set(this.timeElapsed() + 1);
      }
    }, 1000);
  }

  submitAnswer() {
    const problem = this.currentProblem();
    if (!problem || !problem.userAnswer) return;
    
    const userAnswer = parseFloat(problem.userAnswer);
    const isCorrect = Math.abs(userAnswer - problem.answer) < 0.01;
    
    problem.isCorrect = isCorrect;
    
    if (isCorrect) {
      this.correctAnswers.set(this.correctAnswers() + 1);
      this.streak.set(this.streak() + 1);
      this.bestStreak.set(Math.max(this.bestStreak(), this.streak()));
      
      // Time bonus: faster answers get more points
      const timeBonus = Math.max(0, 30 - (this.timeElapsed() % 60));
      const totalPoints = problem.points + timeBonus;
      this.score.set(this.score() + totalPoints);
    } else {
      this.streak.set(0);
    }
  }

  nextProblem() {
    if (this.currentProblemIndex() < this.totalProblems() - 1) {
      this.currentProblemIndex.set(this.currentProblemIndex() + 1);
    } else {
      this.completeGame();
    }
  }

  showHint() {
    if (this.hintsUsed() >= this.maxHints) return;
    
    const problem = this.currentProblem();
    if (!problem) return;
    
    let hint = '';
    switch (problem.type) {
      case 'arithmetic':
        hint = 'Remember the order of operations: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction.';
        break;
      case 'algebra':
        hint = 'Isolate the variable by performing the same operation on both sides of the equation.';
        break;
      default:
        hint = 'Take your time and work through the problem step by step.';
    }
    
    this.currentHint.set(hint);
    this.showingHint.set(true);
    this.hintsUsed.set(this.hintsUsed() + 1);
  }

  closeHint() {
    this.showingHint.set(false);
  }

  skipProblem() {
    if (this.skipsUsed() >= this.maxSkips) return;
    
    const problem = this.currentProblem();
    if (problem) {
      problem.isCorrect = false;
      problem.userAnswer = 'Skipped';
    }
    
    this.skipsUsed.set(this.skipsUsed() + 1);
    this.streak.set(0);
    
    setTimeout(() => this.nextProblem(), 1000);
  }

  completeGame() {
    this.gameCompleted.set(true);
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  playAgain() {
    // Reset all game state
    this.problems = [];
    this.currentProblemIndex.set(0);
    this.score.set(0);
    this.timeElapsed.set(0);
    this.gameStarted.set(false);
    this.gameCompleted.set(false);
    this.selectedDifficulty.set(null);
    this.streak.set(0);
    this.correctAnswers.set(0);
    this.hintsUsed.set(0);
    this.skipsUsed.set(0);
    this.showingHint.set(false);
    
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getAccuracy(): number {
    return this.totalProblems() > 0 ? Math.round((this.correctAnswers() / this.totalProblems()) * 100) : 0;
  }

  getGrade(): string {
    const accuracy = this.getAccuracy();
    if (accuracy >= 90) return 'A';
    if (accuracy >= 80) return 'B';
    if (accuracy >= 70) return 'C';
    if (accuracy >= 60) return 'D';
    return 'F';
  }

  getGradeClass(): string {
    return `grade-${this.getGrade().toLowerCase()}`;
  }

  getGradeDescription(): string {
    const grade = this.getGrade();
    switch (grade) {
      case 'A': return 'Excellent work!';
      case 'B': return 'Great job!';
      case 'C': return 'Good effort!';
      case 'D': return 'Keep practicing!';
      case 'F': return 'Don\'t give up, try again!';
      default: return '';
    }
  }

  getProblemTypeLabel(type: string): string {
    switch (type) {
      case 'arithmetic': return 'Arithmetic';
      case 'algebra': return 'Algebra';
      case 'geometry': return 'Geometry';
      default: return 'Math';
    }
  }
}
