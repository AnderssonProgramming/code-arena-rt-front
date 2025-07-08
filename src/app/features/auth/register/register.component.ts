import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { RegisterRequest } from '../../../core/models/interfaces';

@Component({
  selector: 'app-register',
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
    <div class="register-container">
      <div class="register-background"></div>
      
      <div class="register-content">
        <div class="logo-section">
          <div class="logo">
            <mat-icon class="logo-icon">sports_esports</mat-icon>
          </div>
          <h1 class="app-title">Code Arena</h1>
          <p class="app-subtitle">Únete a la comunidad de programadores</p>
        </div>

        <mat-card class="register-card">
          <mat-card-header>
            <mat-card-title>Crear Cuenta</mat-card-title>
            <mat-card-subtitle>Regístrate para empezar tu aventura</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Usuario</mat-label>
                  <input 
                    matInput 
                    formControlName="username"
                    placeholder="Tu nombre de usuario"
                    [class.error]="registerForm.get('username')?.invalid && registerForm.get('username')?.touched">
                  <mat-icon matSuffix>person</mat-icon>
                  @if (registerForm.get('username')?.hasError('required') && registerForm.get('username')?.touched) {
                    <mat-error>El usuario es requerido</mat-error>
                  }
                  @if (registerForm.get('username')?.hasError('minlength')) {
                    <mat-error>Mínimo 3 caracteres</mat-error>
                  }
                  @if (registerForm.get('username')?.hasError('pattern')) {
                    <mat-error>Solo letras, números y guiones bajos</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Nombre de Display</mat-label>
                  <input 
                    matInput 
                    formControlName="displayName"
                    placeholder="Tu nombre para mostrar">
                  <mat-icon matSuffix>badge</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input 
                  matInput 
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                <mat-icon matSuffix>email</mat-icon>
                @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                  <mat-error>El email es requerido</mat-error>
                }
                @if (registerForm.get('email')?.hasError('email')) {
                  <mat-error>Email inválido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input 
                  matInput 
                  [type]="hidePassword() ? 'password' : 'text'"
                  formControlName="password"
                  placeholder="Mínimo 6 caracteres"
                  [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="'Hide password'" 
                  [attr.aria-pressed]="hidePassword()">
                  <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                  <mat-error>La contraseña es requerida</mat-error>
                }
                @if (registerForm.get('password')?.hasError('minlength')) {
                  <mat-error>Mínimo 6 caracteres</mat-error>
                }
                @if (registerForm.get('password')?.hasError('pattern')) {
                  <mat-error>Debe contener al menos una letra y un número</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Confirmar Contraseña</mat-label>
                <input 
                  matInput 
                  [type]="hideConfirmPassword() ? 'password' : 'text'"
                  formControlName="confirmPassword"
                  placeholder="Repite tu contraseña"
                  [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched">
                <button 
                  mat-icon-button 
                  matSuffix 
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  [attr.aria-label]="'Hide password'" 
                  [attr.aria-pressed]="hideConfirmPassword()">
                  <mat-icon>{{hideConfirmPassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
                @if (registerForm.get('confirmPassword')?.hasError('required') && registerForm.get('confirmPassword')?.touched) {
                  <mat-error>Confirma tu contraseña</mat-error>
                }
                @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
                  <mat-error>Las contraseñas no coinciden</mat-error>
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
                [disabled]="registerForm.invalid || isLoading()">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Creando cuenta...</span>
                } @else {
                  <ng-container>
                    <mat-icon>person_add</mat-icon>
                    <span>Crear Cuenta</span>
                  </ng-container>
                }
              </button>
            </form>
          </mat-card-content>

          <mat-card-actions class="card-actions">
            <p class="login-link">
              ¿Ya tienes cuenta? 
              <a routerLink="/auth/login" class="link">Inicia sesión aquí</a>
            </p>
          </mat-card-actions>
        </mat-card>

        <div class="benefits-section">
          <h3>¿Por qué unirte a Code Arena?</h3>
          <div class="benefit">
            <mat-icon>emoji_events</mat-icon>
            <div>
              <strong>Compite y Mejora</strong>
              <p>Desafía a otros programadores y mejora tus habilidades</p>
            </div>
          </div>
          <div class="benefit">
            <mat-icon>school</mat-icon>
            <div>
              <strong>Aprende Jugando</strong>
              <p>Resuelve problemas mientras te diviertes</p>
            </div>
          </div>
          <div class="benefit">
            <mat-icon>group</mat-icon>
            <div>
              <strong>Comunidad</strong>
              <p>Conecta con programadores de todo el mundo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  errorMessage = signal('');

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly webSocketService: WebSocketService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern(/^\w+$/)
      ]],
      displayName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { confirmPassword, ...registerData } = this.registerForm.value;
      const request: RegisterRequest = registerData;

      this.authService.register(request).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.snackBar.open('¡Cuenta creada exitosamente! Bienvenido a Code Arena!', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });
          
          // Connect to WebSocket
          this.webSocketService.connect();
          
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading.set(false);
          let message = 'Error al crear la cuenta';
          
          if (error.status === 409) {
            message = 'El usuario o email ya existe';
          } else if (error.status === 400) {
            message = 'Datos de registro inválidos';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          
          this.errorMessage.set(message);
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}
