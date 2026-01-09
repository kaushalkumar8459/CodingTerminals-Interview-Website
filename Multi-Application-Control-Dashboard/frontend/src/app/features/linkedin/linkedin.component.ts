import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-linkedin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './linkedin.component.html',
  styleUrls: ['./linkedin.component.scss']
})
export class LinkedInComponent implements OnInit {
  linkedInData: any = {
    profile: {
      name: 'Loading...',
      headline: 'LinkedIn Profile',
      connections: 0
    },
    stats: {
      posts: 0,
      likes: 0,
      comments: 0
    }
  };
  isLoading: boolean = true;

  ngOnInit(): void {
    this.loadLinkedInData();
  }

  loadLinkedInData(): void {
    // Simulated data loading - will be replaced with actual service calls
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
