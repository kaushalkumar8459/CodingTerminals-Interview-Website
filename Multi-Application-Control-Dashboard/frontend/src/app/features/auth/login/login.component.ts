import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // ===== INJECT STORE =====
  readonly authStore = inject(AuthStore);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  loginForm!: FormGroup;
  submitted = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize login form with validation
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Get form controls for template
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Get loading state from store
   */
  get loading() {
    return this.authStore.isLoading();
  }

  /**
   * Get error state from store
   */
  get error() {
    return this.authStore.error();
  }

  /**
   * Get success state from store
   */
  get success() {
    return this.authStore.success();
  }

  /**
   * Handle login form submission (NO direct API call - goes through store)
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    // Call store method instead of authService
    await this.authStore.login(this.loginForm.value);
  }
}
