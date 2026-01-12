import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry({ count: 1, delay: 1000 }),
      catchError((error: HttpErrorResponse) => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Handle HTTP errors based on status code
   */
  private handleError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred';

    switch (error.status) {
      case 400:
        this.handle400(error, errorMessage);
        break;

      case 401:
        this.handle401(error, errorMessage);
        break;

      case 403:
        this.handle403(error, errorMessage);
        break;

      case 404:
        this.handle404(error, errorMessage);
        break;

      case 409:
        this.handle409(error, errorMessage);
        break;

      case 422:
        this.handle422(error, errorMessage);
        break;

      case 500:
        this.handle500(error, errorMessage);
        break;

      case 502:
      case 503:
      case 504:
        this.handleServiceUnavailable(error);
        break;

      default:
        this.handleGenericError(error, errorMessage);
    }
  }

  /**
   * Handle 400 Bad Request
   */
  private handle400(error: HttpErrorResponse, defaultMessage: string): void {
    const message = error.error?.message || 'Invalid request. Please check your input.';
    this.toastService.showError(message);
    console.warn('Bad Request (400):', error.error);
  }

  /**
   * Handle 401 Unauthorized
   */
  private handle401(error: HttpErrorResponse, defaultMessage: string): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.toastService.showError('Session expired. Please log in again.');
    console.warn('Unauthorized (401): User logged out');
  }

  /**
   * Handle 403 Forbidden
   */
  private handle403(error: HttpErrorResponse, defaultMessage: string): void {
    this.router.navigate(['/access-denied']);
    this.toastService.showError('You do not have permission to access this resource.');
    console.warn('Forbidden (403):', error.error);
  }

  /**
   * Handle 404 Not Found
   */
  private handle404(error: HttpErrorResponse, defaultMessage: string): void {
    const message = error.error?.message || 'The requested resource was not found.';
    this.toastService.showError(message);
    console.warn('Not Found (404):', error.error);
  }

  /**
   * Handle 409 Conflict
   */
  private handle409(error: HttpErrorResponse, defaultMessage: string): void {
    const message = error.error?.message || 'There was a conflict with the server state.';
    this.toastService.showWarning(message);
    console.warn('Conflict (409):', error.error);
  }

  /**
   * Handle 422 Validation Error
   */
  private handle422(error: HttpErrorResponse, defaultMessage: string): void {
    const message = error.error?.message || 'Validation error occurred. Please check your input.';
    this.toastService.showError(message);
    console.warn('Validation Error (422):', error.error);
  }

  /**
   * Handle 500 Server Error
   */
  private handle500(error: HttpErrorResponse, defaultMessage: string): void {
    const message = error.error?.message || 'Server error occurred. Please try again later.';
    this.toastService.showError(message);
    console.error('Server Error (500):', error.error);
  }

  /**
   * Handle 502, 503, 504 Service Unavailable
   */
  private handleServiceUnavailable(error: HttpErrorResponse): void {
    this.toastService.showError('Service temporarily unavailable. Please try again later.');
    console.error('Service Unavailable:', error.status, error.error);
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: HttpErrorResponse, defaultMessage: string): void {
    const message = error.error?.message || defaultMessage;
    this.toastService.showError(message);
    console.error('Generic Error:', error);
  }
}