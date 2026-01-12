import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  routerOptions = { exact: true };

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user: User | null) => {
      this.currentUser = user;
    });
  }

  /**
   * Toggle user dropdown menu
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * Close dropdown when clicking outside
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get role badge color based on user role
   */
  getRoleBadgeClass(): string {
    switch (this.currentUser?.role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  /**
   * Get display role name
   */
  getDisplayRole(): string {
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

  /**
   * Close dropdown on escape key
   */
  @HostListener('document:keydown.escape')
  handleEscapeKey(): void {
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }
}
