import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/store/auth.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'frontend-new';
  private authStore = inject(AuthStore);

  ngOnInit(): void {
    // Initialize auth state on app startup
    this.authStore.initializeAuth();
  }
}
