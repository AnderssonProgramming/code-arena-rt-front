import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { 
  Game, 
  Challenge, 
  GamePlayer, 
  GameStatus, 
  GameResults,
  ChallengeDifficulty,
  ChallengeType 
} from '../models/interfaces';

export interface SubmitAnswerRequest {
  gameId: string;
  answer: string;
  timeToAnswer: number;
}

export interface GameStatsResponse {
  totalGames: number;
  gamesWon: number;
  averageScore: number;
  winRate: number;
  bestStreak: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly API_URL = 'http://localhost:8081/api';

  // State management
  private currentGameSubject = new BehaviorSubject<Game | null>(null);
  public currentGame$ = this.currentGameSubject.asObservable();

  private currentChallengeSubject = new BehaviorSubject<Challenge | null>(null);
  public currentChallenge$ = this.currentChallengeSubject.asObservable();

  // Signals
  public currentGame = signal<Game | null>(null);
  public currentChallenge = signal<Challenge | null>(null);
  public isInGame = signal(false);
  public gameTime = signal(0);
  public roundTime = signal(0);

  constructor(private http: HttpClient) {}

  // Get game by ID
  getGameById(gameId: string): Observable<Game> {
    return this.http.get<Game>(`${this.API_URL}/games/${gameId}`)
      .pipe(
        tap(game => {
          this.currentGameSubject.next(game);
          this.currentGame.set(game);
          this.isInGame.set(true);
        })
      );
  }

  // Get current challenge for a game
  getCurrentChallenge(gameId: string): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.API_URL}/games/${gameId}/current-challenge`)
      .pipe(
        tap(challenge => {
          this.currentChallengeSubject.next(challenge);
          this.currentChallenge.set(challenge);
        })
      );
  }

  // Submit an answer
  submitAnswer(request: SubmitAnswerRequest): Observable<{ isCorrect: boolean; score: number; correctAnswer: string }> {
    return this.http.post<{ isCorrect: boolean; score: number; correctAnswer: string }>(
      `${this.API_URL}/games/${request.gameId}/answer`, 
      {
        answer: request.answer,
        timeToAnswer: request.timeToAnswer
      }
    );
  }

  // Get game results
  getGameResults(gameId: string): Observable<GameResults> {
    return this.http.get<GameResults>(`${this.API_URL}/games/${gameId}/results`);
  }

  // Get player's game history
  getPlayerGameHistory(limit: number = 10): Observable<Game[]> {
    return this.http.get<Game[]>(`${this.API_URL}/games/history?limit=${limit}`);
  }

  // Get player stats
  getPlayerStats(): Observable<GameStatsResponse> {
    return this.http.get<GameStatsResponse>(`${this.API_URL}/games/stats`);
  }

  // Get leaderboard
  getLeaderboard(limit: number = 10): Observable<GamePlayer[]> {
    return this.http.get<GamePlayer[]>(`${this.API_URL}/games/leaderboard?limit=${limit}`);
  }

  // Challenge management
  getChallengesByDifficulty(difficulty: ChallengeDifficulty): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.API_URL}/challenges/difficulty/${difficulty}`);
  }

  getChallengesByType(type: ChallengeType): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.API_URL}/challenges/type/${type}`);
  }

  getChallengeById(challengeId: string): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.API_URL}/challenges/${challengeId}`);
  }

  getAllChallenges(): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.API_URL}/challenges`);
  }

  // Utility methods
  isPlayerInGame(game: Game, userId: string): boolean {
    return game.players.some(player => player.userId === userId);
  }

  getPlayerInGame(game: Game, userId: string): GamePlayer | undefined {
    return game.players.find(player => player.userId === userId);
  }

  getPlayerRank(game: Game, userId: string): number {
    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
    const playerIndex = sortedPlayers.findIndex(player => player.userId === userId);
    return playerIndex + 1;
  }

  isGameFinished(game: Game): boolean {
    return game.status === GameStatus.FINISHED;
  }

  canPlayerAnswer(game: Game, userId: string): boolean {
    const player = this.getPlayerInGame(game, userId);
    return !!(player && !player.hasAnswered && game.status === GameStatus.IN_PROGRESS);
  }

  // Timer utilities
  startGameTimer(): void {
    const startTime = Date.now();
    const timer = setInterval(() => {
      this.gameTime.set(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Store timer reference for cleanup
    (this as any).gameTimer = timer;
  }

  startRoundTimer(duration: number): void {
    this.roundTime.set(duration);
    const timer = setInterval(() => {
      const current = this.roundTime();
      if (current > 0) {
        this.roundTime.set(current - 1);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    // Store timer reference for cleanup
    (this as any).roundTimer = timer;
  }

  stopTimers(): void {
    if ((this as any).gameTimer) {
      clearInterval((this as any).gameTimer);
    }
    if ((this as any).roundTimer) {
      clearInterval((this as any).roundTimer);
    }
  }

  // Clear game state
  clearGameState(): void {
    this.currentGameSubject.next(null);
    this.currentChallengeSubject.next(null);
    this.currentGame.set(null);
    this.currentChallenge.set(null);
    this.isInGame.set(false);
    this.gameTime.set(0);
    this.roundTime.set(0);
    this.stopTimers();
  }

  // Format time helper
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
