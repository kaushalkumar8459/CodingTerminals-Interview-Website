import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <div 
        *ngFor="let toast of toasts"
        [ngClass]="getToastClass(toast.type)"
        class="animate-slide-in rounded-lg shadow-lg p-4 flex items-start gap-3 backdrop-blur-sm">
        
        <!-- Icon -->
        <span class="text-xl flex-shrink-0">
          {{ getToastIcon(toast.type) }}
        </span>

        <!-- Message -->
        <div class="flex-1">
          <p class="font-semibold">{{ getToastTitle(toast.type) }}</p>
          <p class="text-sm mt-1">{{ toast.message }}</p>
        </div>

        <!-- Close Button -->
        <button
          *ngIf="toast.dismissible"
          (click)="removeToast(toast.id)"
          class="text-xl flex-shrink-0 hover:opacity-70 transition-opacity">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    :host ::ng-deep .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getToastClass(type: string): string {
    const baseClass = 'border-l-4';
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-50 border-green-500 text-green-900`;
      case 'error':
        return `${baseClass} bg-red-50 border-red-500 text-red-900`;
      case 'warning':
        return `${baseClass} bg-orange-50 border-orange-500 text-orange-900`;
      case 'info':
        return `${baseClass} bg-blue-50 border-blue-500 text-blue-900`;
      default:
        return `${baseClass} bg-gray-50 border-gray-500 text-gray-900`;
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📋';
    }
  }

  getToastTitle(type: string): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Message';
    }
  }
}
