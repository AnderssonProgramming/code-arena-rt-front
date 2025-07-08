import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="auth-layout">
      <div class="auth-container">
        <div class="auth-content">
          <!-- Brand/Logo Section -->
          <div class="auth-header">
            <div class="brand-logo">
              <h1 class="brand-title text-gradient">Code Arena</h1>
              <p class="brand-subtitle">Challenge your mind, compete with others</p>
            </div>
          </div>

          <!-- Auth Form Content -->
          <div class="auth-form-container">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer -->
          <div class="auth-footer">
            <p>&copy; 2024 Code Arena. Ready to compete?</p>
          </div>
        </div>

        <!-- Background decoration -->
        <div class="auth-background">
          <div class="geometric-pattern">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
            <div class="shape shape-4"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    }

    .auth-container {
      width: 100%;
      max-width: 450px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
      z-index: 2;
    }

    .auth-content {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      padding: 3rem 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .brand-title {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .brand-subtitle {
      color: #6b7280;
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .auth-form-container {
      margin-bottom: 2rem;
    }

    .auth-footer {
      text-align: center;
      
      p {
        color: #9ca3af;
        font-size: 0.875rem;
        margin: 0;
      }
    }

    .auth-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      overflow: hidden;
    }

    .geometric-pattern {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 6s ease-in-out infinite;
    }

    .shape-1 {
      width: 200px;
      height: 200px;
      top: 10%;
      left: -5%;
      animation-delay: 0s;
    }

    .shape-2 {
      width: 150px;
      height: 150px;
      top: 70%;
      right: -5%;
      animation-delay: 2s;
    }

    .shape-3 {
      width: 100px;
      height: 100px;
      top: 30%;
      right: 20%;
      animation-delay: 4s;
    }

    .shape-4 {
      width: 80px;
      height: 80px;
      bottom: 20%;
      left: 15%;
      animation-delay: 1s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(180deg);
      }
    }

    @media (max-width: 768px) {
      .auth-container {
        padding: 1rem;
      }

      .auth-content {
        padding: 2rem 1.5rem;
      }

      .brand-title {
        font-size: 2rem;
      }
    }
  `]
})
export class AuthLayoutComponent {
}
