import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { DebugInterceptor } from './core/interceptors/debug.interceptor';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard, ModuleGuard } from './core/guards/role.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([])
    ),
    // Register Interceptors (Class-based) - ORDER MATTERS!
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DebugInterceptor,  // Debug first to see requests
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    // Register Guards
    AuthGuard,
    RoleGuard,
    ModuleGuard
  ]
};
