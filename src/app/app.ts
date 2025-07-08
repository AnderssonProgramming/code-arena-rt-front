import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected authService = inject(AuthService);
  private readonly router = inject(Router);

  isLoading = false;
  title = 'Code Arena';

  ngOnInit(): void {
    // Initialize app
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    // If user is not authenticated and not on auth pages, redirect to login
    const currentUrl = this.router.url;
    if (!this.authService.isAuthenticated() && !currentUrl.includes('/auth')) {
      this.router.navigate(['/auth/login']);
    }
  }

  logout(): void {
    this.isLoading = true;
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.isLoading = false;
  }
}
