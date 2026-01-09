import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  articles: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  stats = {
    total: 0,
    published: 0,
    drafts: 0
  };

  ngOnInit(): void {
    this.loadBlogArticles();
    this.loadStats();
  }

  loadBlogArticles(): void {
    // Simulated data - will be replaced with actual service calls
    setTimeout(() => {
      this.articles = [];
      this.isLoading = false;
    }, 1000);
  }

  loadStats(): void {
    this.stats = { total: 0, published: 0, drafts: 0 };
  }
}
