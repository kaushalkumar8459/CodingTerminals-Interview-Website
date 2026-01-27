import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';
import { PermissionService } from '../../../core/services/permission.service';
// Import the authorization directives
import { HasRoleDirective, HasPermissionDirective, AuthDisabledDirective } from '../../../core/directives';
import { RoleType } from '../../../core/models/role.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  requiredRole?: RoleType[];
  moduleId?: string;
  children?: MenuItem[];
  badge?: string | null;
  badgeColor?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive,
    // Add the authorization directives
    HasRoleDirective,
    HasPermissionDirective,
    AuthDisabledDirective
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  RoleType = RoleType;
  
  currentUser: User | null = null;
  isSidebarOpen = true;
  menuItems: MenuItem[] = [];
  expandedMenus: Set<string> = new Set();
  isDesktop = true;
  routerOptions = { exact: false };

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to user changes
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
      this.buildMenuItems();
    });

    // Check if desktop or mobile
    this.checkScreenSize();
  }

  /**
   * Check if screen is desktop size
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isDesktop = window.innerWidth >= 768;
  }

  /**
   * Build menu items based on user role and enabled modules
   */
  private buildMenuItems(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: '📊',
        route: '/dashboard',
        badge: null
      },
      {
        label: 'Content',
        icon: '📁',
        route: '#',
        children: [
          {
            label: 'Study Notes',
            icon: '📚',
            route: '/study-notes',
            moduleId: 'study_notes'
          },
          {
            label: 'YouTube',
            icon: '▶️',
            route: '/youtube',
            moduleId: 'youtube'
          },
          {
            label: 'LinkedIn',
            icon: '💼',
            route: '/linkedin',
            moduleId: 'linkedin'
          },
          {
            label: 'Blog',
            icon: '✍️',
            route: '/blog',
            moduleId: 'blog'
          }
        ]
      }
    ];

    // Add admin section for admin & super_admin
    if (this.currentUser?.role === 'super_admin' || this.currentUser?.role === 'admin') {
      this.menuItems.push({
        label: 'Administration',
        icon: '⚙️',
        route: '#',
        requiredRole: [RoleType.SUPER_ADMIN, RoleType.ADMIN],
        children: [
          {
            label: 'Admin Dashboard',
            icon: '📈',
            route: '/admin',
            requiredRole: [RoleType.SUPER_ADMIN, RoleType.ADMIN]
          },
          {
            label: 'Users',
            icon: '👥',
            route: '/admin/users',
            requiredRole: [RoleType.SUPER_ADMIN],
            badge: '12'
          },
          {
            label: 'Modules',
            icon: '🔧',
            route: '/admin/modules',
            requiredRole: [RoleType.SUPER_ADMIN]
          }
        ]
      });
    }

    // Add user section
    this.menuItems.push({
      label: 'Account',
      icon: '👤',
      route: '#',
      children: [
        {
          label: 'My Profile',
          icon: '👤',
          route: '/profile'
        },
        {
          label: 'Settings',
          icon: '⚙️',
          route: '/settings'
        }
      ]
    });
  }

  /**
   * Check if menu item should be visible based on role and permissions
   */
  isMenuItemVisible(item: MenuItem): boolean {
    // Check role requirement
    if (item.requiredRole) {
      return item.requiredRole.includes(this.currentUser?.role as RoleType);
    }

    // Check module access
    if (item.moduleId) {
      return this.permissionService.hasModuleAccess(item.moduleId);
    }

    // Check children visibility
    if (item.children) {
      return item.children.some(child => this.isMenuItemVisible(child));
    }

    return true;
  }

  /**
   * Check if menu item has visible children
   */
  hasVisibleChildren(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isMenuItemVisible(child));
  }

  /**
   * Toggle menu item expansion
   */
  toggleMenu(item: MenuItem): void {
    if (!item.children) return;

    const key = item.label;
    if (this.expandedMenus.has(key)) {
      this.expandedMenus.delete(key);
    } else {
      this.expandedMenus.add(key);
    }
  }

  /**
   * Check if menu is expanded
   */
  isMenuExpanded(item: MenuItem): boolean {
    return this.expandedMenus.has(item.label);
  }

  /**
   * Toggle sidebar open/closed
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    // Close on mobile
    if (!this.isDesktop) {
      setTimeout(() => {
        this.isSidebarOpen = false;
      }, 300);
    }
  }

  /**
   * Navigate and close sidebar on mobile
   */
  navigateTo(route: string): void {
    if (route !== '#') {
      this.router.navigate([route]);
      if (!this.isDesktop) {
        this.isSidebarOpen = false;
      }
    }
  }

  /**
   * Get role display name
   */
  getRoleDisplay(): string {
    switch (this.currentUser?.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'viewer':
        return 'Viewer';
      default:
        return 'User';
    }
  }

  /**
   * Get role icon
   */
  getRoleIcon(): string {
    switch (this.currentUser?.role) {
      case 'super_admin':
        return '👑';
      case 'admin':
        return '⚙️';
      case 'viewer':
        return '👁️';
      default:
        return '👤';
    }
  }
}