import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if already logged in
    const token = this.authService.getToken();
    if (token) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.errorMessage = '';
    this.isLoading = true;

    // Validate inputs
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password';
      this.isLoading = false;
      return;
    }

    // Call auth service
    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response && response.accessToken) {
          // Token is automatically stored in AuthService
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid response from server';
        }
      },
      (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please try again.';
      }
    );
  }
}
