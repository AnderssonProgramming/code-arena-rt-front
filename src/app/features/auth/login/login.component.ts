import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { LoginRequest } from '../../../core/models/interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="login-container">
      <div class="login-background"></div>
      
      <div class="login-content">
        <div class="logo-section">
          <div class="logo">
            <mat-icon class="logo-icon">sports_esports</mat-icon>
          </div>
          <h1 class="app-title">Code Arena</h1>
          <p class="app-subtitle">Compite, Aprende, Domina</p>
        </div>

        <mat-card class="login-card">
          <mat-card-header>
            <mat-card-title>Iniciar Sesión</mat-card-title>
            <mat-card-subtitle>Accede a tu cuenta para empezar a jugar</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Usuario o Email</mat-label>
                <input 
                  matInput 
                  formControlName="usernameOrEmail"
                  placeholder="Ingresa tu usuario o email"
                  [class.error]="loginForm.get('usernameOrEmail')?.invalid && loginForm.get('usernameOrEmail')?.touched">
                <mat-icon matSuffix>person</mat-icon>
                @if (loginForm.get('usernameOrEmail')?.hasError('required') && loginForm.get('usernameOrEmail')?.touched) {
                  <mat-error>El usuario o email es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Ingresa tu contraseña"
                  [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="'Hide password'" 
                  [attr.aria-pressed]="hidePassword()">
                  <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>La contraseña es requerida</mat-error>
                }
                @if (loginForm.get('password')?.hasError('minlength')) {
                  <mat-error>La contraseña debe tener al menos 6 caracteres</mat-error>
                }
              </mat-form-field>

              @if (errorMessage()) {
                <div class="error-message">
                  <mat-icon>error</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                class="full-width submit-btn"
                [disabled]="loginForm.invalid || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Iniciando sesión...</span>
                } @else {
                  <span>Iniciar Sesión</span>
                  <mat-icon>login</mat-icon>
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions class="card-actions">
            <p class="register-link">
              ¿No tienes cuenta? 
              <a routerLink="/auth/register" class="link">Regístrate aquí</a>
            </p>
          </mat-card-actions>
        </mat-card>

        <div class="features-section">
          <div class="feature">
            <mat-icon>people</mat-icon>
            <span>Multijugador en tiempo real</span>
          </div>
          <div class="feature">
            <mat-icon>leaderboard</mat-icon>
            <span>Rankings globales</span>
          </div>
          <div class="feature">
            <mat-icon>psychology</mat-icon>
            <span>Desafíos de programación</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.snackBar.open('¡Bienvenido a Code Arena!', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          
          // Connect to WebSocket
          this.webSocketService.connect();
          
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          let message = 'Error al iniciar sesión';
          
          if (error.status === 401) {
            message = 'Credenciales incorrectas';
          } else if (error.status === 404) {
            message = 'Usuario no encontrado';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          
          this.errorMessage.set(message);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
