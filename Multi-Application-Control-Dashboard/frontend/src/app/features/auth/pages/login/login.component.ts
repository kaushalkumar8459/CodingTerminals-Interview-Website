import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Login</h1>
        
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
            <div *ngIf="email?.invalid && email?.touched" class="text-red-500 text-sm mt-1">
              Please enter a valid email
            </div>
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Password</label>
            <input 
              type="password" 
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <div *ngIf="password?.invalid && password?.touched" class="text-red-500 text-sm mt-1">
              Password is required
            </div>
          </div>

          <button 
            type="submit"
            [disabled]="loginForm.invalid || isLoading"
            class="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>

          <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {{ error }}
          </div>
        </form>

        <p class="text-center text-gray-600 mt-6">
          Don't have an account?
          <a routerLink="/auth/register" class="text-blue-600 font-semibold hover:underline">Register here</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;

      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.error?.message || 'Login failed. Please try again.';
        }
      });
    }
  }
}
