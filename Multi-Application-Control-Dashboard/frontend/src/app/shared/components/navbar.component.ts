import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  userRole = 'Admin';
  userName = 'John Doe';
  userInitial = 'JD';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Get user info from auth service
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userInitial = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        this.userRole = user.role;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}