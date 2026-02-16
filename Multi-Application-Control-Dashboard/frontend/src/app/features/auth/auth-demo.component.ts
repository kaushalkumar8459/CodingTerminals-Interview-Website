import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthStore } from '../../core/store/auth.store';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-auth-demo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-demo-container">
      <h2>JWT Authentication Demo</h2>
      
      <!-- Login Status -->
      <div class="status-card">
        <h3>Authentication Status</h3>
        <p><strong>Is Authenticated:</strong> {{ isAuthenticated ? '✅ Yes' : '❌ No' }}</p>
        <p><strong>Current User:</strong> {{ currentUser?.email || 'Not logged in' }}</p>
        <p><strong>User Role:</strong> {{ currentUser?.role || 'N/A' }}</p>
        <p><strong>Assigned Modules:</strong> {{ currentUser?.assignedModules?.length || 0 }}</p>
      </div>

      <!-- Demo Actions -->
      <div class="actions-card" *ngIf="!isAuthenticated">
        <h3>Login Demos</h3>
        <div class="button-group">
          <button (click)="loginAsSuperAdmin()" class="btn btn-primary">
            Login as Super Admin
          </button>
          <button (click)="loginAsAdmin()" class="btn btn-secondary">
            Login as Admin
          </button>
          <button (click)="loginAsViewer()" class="btn btn-info">
            Login as Viewer
          </button>
        </div>
      </div>

      <!-- User Actions -->
      <div class="actions-card" *ngIf="isAuthenticated">
        <h3>User Actions</h3>
        <div class="button-group">
          <button (click)="testApiCall()" class="btn btn-success">
            Test Protected API Call
          </button>
          <button (click)="manualRefreshToken()" class="btn btn-warning">
            Manual Token Refresh
          </button>
          <button (click)="logout()" class="btn btn-danger">
            Logout
          </button>
        </div>
      </div>

      <!-- Token Info -->
      <div class="token-card" *ngIf="isAuthenticated">
        <h3>Token Information</h3>
        <p><strong>Access Token:</strong> {{ accessToken?.substring(0, 50) }}...</p>
        <p><strong>Refresh Token:</strong> {{ refreshTokenValue?.substring(0, 50) }}...</p>
      </div>

      <!-- Error Messages -->
      <div class="error-card" *ngIf="errorMessage">
        <h3>Error</h3>
        <p>{{ errorMessage }}</p>
        <button (click)="clearError()" class="btn btn-secondary">Clear</button>
      </div>

      <!-- Success Messages -->
      <div class="success-card" *ngIf="successMessage">
        <h3>Success</h3>
        <p>{{ successMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .auth-demo-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      font-family: Arial, sans-serif;
    }

    .status-card, .actions-card, .token-card, .error-card, .success-card {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
    }

    .status-card {
      background: #e8f5e8;
      border-color: #28a745;
    }

    .error-card {
      background: #f8d7da;
      border-color: #dc3545;
    }

    .success-card {
      background: #d4edda;
      border-color: #28a745;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-success { background: #28a745; color: white; }
    .btn-warning { background: #ffc107; color: black; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-info { background: #17a2b8; color: white; }

    .btn:hover {
      opacity: 0.8;
    }
  `]
})
export class AuthDemoComponent implements OnInit {
  private authService = inject(AuthService);
  private authStore = inject(AuthStore);
  private router = inject(Router);

  isAuthenticated = false;
  currentUser: any = null;
  accessToken: string | null = null;
  refreshTokenValue: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    // Get current state from auth store
    this.isAuthenticated = this.authStore.isAuthenticated();
    this.currentUser = this.authStore.currentUser();
    
    // Get current token info
    this.accessToken = this.authService.getAccessToken();
    this.refreshTokenValue = localStorage.getItem('refreshToken');
  }

  loginAsSuperAdmin(): void {
    this.loginDemoUser('admin@example.com', 'AdminPass123!');
  }

  loginAsAdmin(): void {
    this.loginDemoUser('editor@example.com', 'EditorPass123!');
  }

  loginAsViewer(): void {
    this.loginDemoUser('viewer@example.com', 'ViewerPass123!');
  }

  private async loginDemoUser(email: string, password: string): Promise<void> {
    try {
      await this.authStore.login({ email, password });
      this.successMessage = `Successfully logged in as ${email}`;
      this.clearMessagesAfterDelay();
      // Update local state after login
      this.isAuthenticated = this.authStore.isAuthenticated();
      this.currentUser = this.authStore.currentUser();
      this.accessToken = this.authService.getAccessToken();
      this.refreshTokenValue = localStorage.getItem('refreshToken');
    } catch (error: any) {
      this.errorMessage = error?.message || 'Login failed';
    }
  }

  async testApiCall(): Promise<void> {
    try {
      // This will automatically use the auth interceptor to add the token
      const response = await fetch('http://localhost:3000/api/study-notes');
      if (response.ok) {
        this.successMessage = 'API call successful! Token authentication working.';
      } else {
        this.errorMessage = `API call failed: ${response.status} ${response.statusText}`;
      }
      this.clearMessagesAfterDelay();
    } catch (error: any) {
      this.errorMessage = `API call error: ${error.message}`;
    }
  }

  async manualRefreshToken(): Promise<void> {
    try {
      this.authService.refreshToken().subscribe({
        next: (response) => {
          this.accessToken = this.authService.getAccessToken();
          this.refreshTokenValue = localStorage.getItem('refreshToken');
          this.successMessage = 'Token refreshed successfully!';
          this.clearMessagesAfterDelay();
        },
        error: (error) => {
          this.errorMessage = `Token refresh failed: ${error.message}`;
        }
      });
    } catch (error: any) {
      this.errorMessage = `Token refresh failed: ${error.message}`;
    }
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.accessToken = null;
    this.refreshTokenValue = null;
    this.successMessage = 'Logged out successfully!';
    this.clearMessagesAfterDelay();
  }

  clearError(): void {
    this.errorMessage = null;
  }

  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.errorMessage = null;
      this.successMessage = null;
    }, 3000);
  }
}