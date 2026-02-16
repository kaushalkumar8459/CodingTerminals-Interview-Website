import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class DebugInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('=== HTTP REQUEST DEBUG ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers.keys().map(key => ({ key, value: req.headers.get(key) })));
    console.log('Has Authorization:', req.headers.has('Authorization'));
    console.log('Authorization Value:', req.headers.get('Authorization'));
    console.log('Token in localStorage:', localStorage.getItem('accessToken') ? 'YES' : 'NO');
    console.log('========================');

    return next.handle(req).pipe(
      tap(
        event => {
          console.log('HTTP Response:', event);
        },
        error => {
          console.log('HTTP Error:', error);
        }
      )
    );
  }
}