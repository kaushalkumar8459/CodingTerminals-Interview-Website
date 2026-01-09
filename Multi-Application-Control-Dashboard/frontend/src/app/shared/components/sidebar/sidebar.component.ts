import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModuleSettingsService } from '../../../features/admin/services/module-settings.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  // UI Properties
  isCollapsed = false;
  
  // User Properties
  userRole = 'Admin';
  userName = 'John Doe';
  userInitial = 'JD';
  assignedModules: string[] = [];
  
  // Menu Items
  menuItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'YouTube', icon: '🎥', route: '/youtube' },
    { label: 'Study Notes', icon: '📚', route: '/study-notes' },
    { label: 'LinkedIn', icon: '💼', route: '/linkedin' },
    { label: 'Blog', icon: '📝', route: '/blog' },
    { label: 'Admin', icon: '⚙️', route: '/admin' },
  ];

  constructor(
    private authService: AuthService,
    private moduleService: ModuleSettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userInitial = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        this.userRole = user.role;
        this.assignedModules = user.assignedModules || [];
        this.filterMenuByRole();
      }
    });
  }

  filterMenuByRole(): void {
    // Filter menu items based on user role and module access
    this.menuItems = this.menuItems.filter(item => {
      // Admin can see all items
      if (this.isSuperAdmin() || this.isAdmin()) {
        return true;
      }
      // Regular users can see specific items
      return this.hasModuleAccess(item.label);
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  hasModuleAccess(moduleName: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this.assignedModules.includes(moduleName);
  }

  isSuperAdmin(): boolean {
    return this.userRole === 'SUPER_ADMIN';
  }

  isAdmin(): boolean {
    return this.userRole === 'ADMIN' || this.userRole === 'SUPER_ADMIN';
  }
}
