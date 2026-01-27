import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RoleType } from '../../core/models/role.model';

@Component({
  selector: 'app-personal-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './personal-dashboard.component.html',
  styleUrl: './personal-dashboard.component.scss',
})
export class PersonalDashboardComponent implements OnInit {
  currentUser: any = null;
  userInitials: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.userInitials = (this.currentUser.firstName?.charAt(0) || '') + (this.currentUser.lastName?.charAt(0) || '');
    }
  }

  getRoleDisplayText(role: string | undefined): string {
    switch (role) {
      case RoleType.SUPER_ADMIN:
        return 'Super Admin';
      case RoleType.ADMIN:
        return 'Admin';
      case RoleType.VIEWER:
        return 'Viewer';
      case RoleType.NORMAL_USER:
        return 'Normal User';
      default:
        return 'User';
    }
  }
}
