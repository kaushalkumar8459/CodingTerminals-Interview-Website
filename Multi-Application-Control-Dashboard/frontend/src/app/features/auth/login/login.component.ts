import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        <!-- Logo/Title -->
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🎯</div>
          <h1 class="text-3xl font-bold text-slate-900">Control Dashboard</h1>
          <p class="text-slate-600 mt-2">Manage all your content in one place</p>
        </div>

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p *ngIf="isFieldInvalid('email')" class="text-red-500 text-xs mt-1">
              Please enter a valid email
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              formControlName="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p *ngIf="isFieldInvalid('password')" class="text-red-500 text-xs mt-1">
              Password is required
            </p>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {{ errorMessage }}
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            [disabled]="isLoading || loginForm.invalid"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading">Signing in...</span>
          </button>
        </form>

        <!-- Demo Credentials -->
        <div class="mt-6 pt-6 border-t border-slate-200">
          <p class="text-xs text-slate-600 mb-3 font-semibold">Demo Credentials:</p>
          <div class="space-y-2 text-xs bg-blue-50 p-3 rounded">
            <p><strong>Super Admin:</strong> admin@example.com / Admin@123</p>
            <p><strong>Admin:</strong> editor@example.com / Editor@123</p>
            <p><strong>Viewer:</strong> viewer@example.com / Viewer@123</p>
          </div>
        </div>

        <!-- Sign Up Link -->
        <p class="text-center text-slate-600 text-sm mt-6">
          Don't have an account?
          <a routerLink="/auth/register" class="text-blue-600 hover:underline font-semibold">
            Sign up
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
