import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private toastIdCounter = 0;

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  showSuccess(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  showWarning(message: string, duration = 3000): void {
    this.show(message, 'warning', duration);
  }

  showInfo(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void {
    const id = `toast-${++this.toastIdCounter}`;
    const toast: Toast = { id, message, type, duration, dismissible: true };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  removeToast(id: string): void {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toasts$.next([]);
  }
}
