import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
      <div class="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">Register</h1>
        
        <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4">
          <div>
            <label class="block text-gray-700 font-semibold mb-2">First Name</label>
            <input 
              type="text" 
              formControlName="firstName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="John"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Last Name</label>
            <input 
              type="text" 
              formControlName="lastName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Doe"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Password</label>
            <input 
              type="password" 
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-semibold mb-2">Confirm Password</label>
            <input 
              type="password" 
              formControlName="confirmPassword"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
            <div *ngIf="registerForm.get('confirmPassword')?.touched && registerForm.getError('passwordMismatch')" class="text-red-500 text-sm mt-1">
              Passwords do not match
            </div>
          </div>

          <button 
            type="submit"
            [disabled]="registerForm.invalid || isLoading"
            class="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
          >
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>

          <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {{ error }}
          </div>
        </form>

        <p class="text-center text-gray-600 mt-6">
          Already have an account?
          <a routerLink="/auth/login" class="text-green-600 font-semibold hover:underline">Login here</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;

      const { firstName, lastName, email, password } = this.registerForm.value;
      this.authService.register(firstName, lastName, email, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
