import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, retry } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

interface ErrorResponse {
  status: number;
  message: string;
  timestamp: Date;
  path?: string;
}

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    retry({ count: 1, delay: 1000 }),
    catchError((error: HttpErrorResponse) => {
      const errorResponse: ErrorResponse = {
        status: error.status,
        message: error.message,
        timestamp: new Date(),
        path: error.url || undefined,
      };

      // Log error for debugging
      console.error('HTTP Error:', errorResponse);

      switch (error.status) {
        case 400:
          handleBadRequest(error);
          break;

        case 401:
          handleUnauthorized(authService, router);
          break;

        case 403:
          handleForbidden(router);
          break;

        case 404:
          handleNotFound(error);
          break;

        case 409:
          handleConflict(error);
          break;

        case 422:
          handleValidationError(error);
          break;

        case 500:
          handleServerError(error);
          break;

        case 502:
        case 503:
        case 504:
          handleServiceUnavailable(error);
          break;

        default:
          handleGenericError(error);
      }

      return throwError(() => error);
    })
  );
};

function handleBadRequest(error: HttpErrorResponse): void {
  const message = error.error?.message || 'Invalid request. Please check your input.';
  console.warn('Bad Request (400):', error.error);
  // Notification can be handled by the component level
}

function handleUnauthorized(
  authService: AuthService,
  router: Router
): void {
  authService.logout();
  router.navigate(['/auth/login']);
  console.warn('Unauthorized (401): Redirecting to login');
}

function handleForbidden(router: Router): void {
  router.navigate(['/dashboard']);
  console.warn('Forbidden (403): Redirecting to dashboard');
}

function handleNotFound(error: HttpErrorResponse): void {
  const message = error.error?.message || 'The requested resource was not found.';
  console.warn('Not Found (404):', error.error);
}

function handleConflict(error: HttpErrorResponse): void {
  const message =
    error.error?.message || 'There was a conflict with the server state.';
  console.warn('Conflict (409):', error.error);
}

function handleValidationError(error: HttpErrorResponse): void {
  const message = error.error?.message || 'Validation error occurred.';
  console.warn('Validation Error (422):', error.error);
}

function handleServerError(error: HttpErrorResponse): void {
  const message =
    error.error?.message ||
    'An unexpected server error occurred. Please try again later.';
  console.error('Server Error (500):', error.error);
}

function handleServiceUnavailable(
  error: HttpErrorResponse
): void {
  console.error('Service Unavailable:', error.status, error.error);
}

function handleGenericError(error: HttpErrorResponse): void {
  console.error('Generic Error:', error);
}
