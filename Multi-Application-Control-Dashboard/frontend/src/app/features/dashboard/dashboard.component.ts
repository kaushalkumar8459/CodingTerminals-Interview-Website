import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { YouTubeService } from '../services/youtube.service';
import { StudyNotesService } from '../services/study-notes.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any;
  isLoading: boolean = true;
  
  dashboardStats = {
    totalUsers: 0,
    youtubePosts: 0,
    youtubePublished: 0,
    studyNotes: 0,
    studyNotesPublic: 0,
    totalApplications: 0
  };
  
  recentUsers: any[] = [];
  errorMessage: string = '';

  constructor(
    private adminService: AdminService,
    private youtubeService: YouTubeService,
    private studyNotesService: StudyNotesService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.currentUser = this.authService.getCurrentUser();
    
    this.loadCurrentUser();
    this.loadDashboardStats();
    this.loadRecentUsers();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe((user: any) => {
      this.currentUser = user;
    });
  }

  loadDashboardStats(): void {
    // Load admin stats
    this.adminService.getDashboardStats().subscribe(
      (stats: any) => {
        this.dashboardStats.totalUsers = stats.totalUsers || 0;
        this.dashboardStats.totalApplications = stats.totalApplications || 0;
      },
      (error: any) => {
        console.error('Error loading admin stats:', error);
        this.errorMessage = 'Failed to load dashboard statistics';
      }
    );

    // Load YouTube stats
    this.youtubeService.getStats().subscribe(
      (stats: any) => {
        this.dashboardStats.youtubePosts = stats.total || 0;
        this.dashboardStats.youtubePublished = stats.published || 0;
      },
      (error: any) => {
        console.error('Error loading YouTube stats:', error);
      }
    );

    // Load Study Notes stats
    this.studyNotesService.getStats().subscribe(
      (stats: any) => {
        this.dashboardStats.studyNotes = stats.total || 0;
        this.dashboardStats.studyNotesPublic = stats.public_notes || 0;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error loading Study Notes stats:', error);
        this.isLoading = false;
      }
    );
  }

  loadRecentUsers(): void {
    this.adminService.getRecentUsers(5).subscribe(
      (users: any[]) => {
        this.recentUsers = users || [];
      },
      (error: any) => {
        console.error('Error loading recent users:', error);
        this.recentUsers = [];
      }
    );
  }
}
