import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.getToasts().subscribe((toasts: any) => {
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
