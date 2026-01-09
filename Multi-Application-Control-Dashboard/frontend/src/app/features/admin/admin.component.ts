import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0
  };

  ngOnInit(): void {
    this.loadAdminData();
    this.loadStats();
  }

  loadAdminData(): void {
    // Simulated data loading - will be replaced with actual service calls
    setTimeout(() => {
      this.users = [];
      this.isLoading = false;
    }, 1000);
  }

  loadStats(): void {
    this.stats = { totalUsers: 0, activeUsers: 0, adminUsers: 0 };
  }
}
