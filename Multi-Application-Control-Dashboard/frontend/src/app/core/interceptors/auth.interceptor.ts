import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token directly from localStorage (more reliable)
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isRefreshing) {
          return this.handle401Error(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        this.isRefreshing = false;
        // Clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/auth/login';
        return throwError(() => new Error('No refresh token available'));
      }

      // Make refresh request directly (avoiding interceptor recursion)
      const refreshRequest = new HttpRequest('POST', 'http://localhost:3000/api/auth/refresh', { refreshToken });
      
      return next.handle(refreshRequest).pipe(
        switchMap((response: any) => {
          const newToken = response.body.accessToken;
          const newRefreshToken = response.body.refreshToken;
          
          // Store new tokens
          localStorage.setItem('accessToken', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          this.isRefreshing = false;
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addToken(request, newToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          // Clear auth on refresh failure
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/auth/login';
          return throwError(() => error);
        })
      );
    } else {
      // Wait for the refresh to complete
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
