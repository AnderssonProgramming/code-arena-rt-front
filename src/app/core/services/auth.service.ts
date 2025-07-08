import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8081/api';
  private readonly TOKEN_KEY = 'code_arena_token';
  private readonly USER_KEY = 'code_arena_user';

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signals for reactive UI
  public isAuthenticated = signal(false);
  public currentUser = signal<User | null>(null);

  private readonly platformId = inject(PLATFORM_ID);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip initialization during SSR
    }
    
    const token = this.getToken();
    const user = this.getStoredUser();
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, userData)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null; // Return null during SSR
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null; // Return null during SSR
    }
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }
    this.currentUserSubject.next(response.user);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`)
      .pipe(
        tap(user => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
          this.currentUser.set(user);
        })
      );
  }

  updateProfile(profileData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/users/me`, profileData)
      .pipe(
        tap(user => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
          this.currentUser.set(user);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  }
}
