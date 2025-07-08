import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameSession, GameStats } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameHistoryService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api';

  /**
   * Get recent games for current user
   */
  getRecentGames(limit: number = 10): Observable<GameSession[]> {
    return this.http.get<GameSession[]>(`${this.API_URL}/games/recent?limit=${limit}`);
  }

  /**
   * Get game history with pagination
   */
  getGameHistory(page: number = 0, size: number = 20): Observable<{
    content: GameSession[];
    totalElements: number;
    totalPages: number;
    last: boolean;
  }> {
    return this.http.get<{
      content: GameSession[];
      totalElements: number;
      totalPages: number;
      last: boolean;
    }>(`${this.API_URL}/games/history?page=${page}&size=${size}`);
  }

  /**
   * Get game session by ID
   */
  getGameSession(gameId: string): Observable<GameSession> {
    return this.http.get<GameSession>(`${this.API_URL}/games/${gameId}`);
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<GameStats> {
    return this.http.get<GameStats>(`${this.API_URL}/games/stats`);
  }

  /**
   * Get game statistics by type
   */
  getStatsByGameType(gameType: string): Observable<GameStats> {
    return this.http.get<GameStats>(`${this.API_URL}/games/stats/${gameType}`);
  }

  /**
   * Get leaderboard for a specific game type
   */
  getLeaderboard(gameType: string, period: 'daily' | 'weekly' | 'monthly' | 'all' = 'all'): Observable<{
    rank: number;
    user: { id: string; username: string; avatar?: string };
    score: number;
    gamesPlayed: number;
    winRate: number;
  }[]> {
    return this.http.get<{
      rank: number;
      user: { id: string; username: string; avatar?: string };
      score: number;
      gamesPlayed: number;
      winRate: number;
    }[]>(`${this.API_URL}/games/leaderboard/${gameType}?period=${period}`);
  }

  /**
   * Get detailed game replay data
   */
  getGameReplay(gameId: string): Observable<{
    gameSession: GameSession;
    moves: any[];
    timeline: any[];
  }> {
    return this.http.get<{
      gameSession: GameSession;
      moves: any[];
      timeline: any[];
    }>(`${this.API_URL}/games/${gameId}/replay`);
  }

  /**
   * Get games filtered by date range
   */
  getGamesByDateRange(startDate: Date, endDate: Date): Observable<GameSession[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return this.http.get<GameSession[]>(`${this.API_URL}/games/range?start=${start}&end=${end}`);
  }

  /**
   * Get user's best performances
   */
  getBestPerformances(gameType?: string): Observable<{
    bestScore: number;
    fastestWin: number;
    longestStreak: number;
    mostRecentWin: GameSession;
  }> {
    const params = gameType ? `?gameType=${gameType}` : '';
    return this.http.get<{
      bestScore: number;
      fastestWin: number;
      longestStreak: number;
      mostRecentWin: GameSession;
    }>(`${this.API_URL}/games/best-performances${params}`);
  }
}
