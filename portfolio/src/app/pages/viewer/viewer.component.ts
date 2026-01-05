import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss'
})
export class ViewerComponent implements OnInit {
  portfolios: any[] = [];
  filteredPortfolios: any[] = [];
  loading = false;
  selectedCategory = 'all';
  selectedStatus = 'all';
  
  categories = ['Web Development', 'Mobile App', 'UI/UX Design', 'Data Science', 'Other'];

  constructor(private portfolioService: PortfolioService) {}

  ngOnInit() {
    this.loadPortfolios();
  }

  // ==================== READ ONLY Operations ====================
  
  loadPortfolios() {
    this.loading = true;
    this.portfolioService.getAllPortfolios().subscribe({
      next: (response) => {
        this.portfolios = response.data;
        this.filteredPortfolios = [...this.portfolios];
        this.loading = false;
        console.log('✅ Portfolios loaded for viewer:', this.portfolios.length);
      },
      error: (error) => {
        console.error('❌ Error loading portfolios:', error);
        this.loading = false;
        alert('Failed to load portfolios');
      }
    });
  }

  // ==================== Filter Functions ====================
  
  filterByCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredPortfolios = this.portfolios.filter(portfolio => {
      const categoryMatch = this.selectedCategory === 'all' || portfolio.category === this.selectedCategory;
      const statusMatch = this.selectedStatus === 'all' || portfolio.status === this.selectedStatus;
      return categoryMatch && statusMatch;
    });
  }

  resetFilters() {
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.filteredPortfolios = [...this.portfolios];
  }
}
