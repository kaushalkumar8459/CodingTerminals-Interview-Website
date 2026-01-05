import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../services/profile.service';
import { ExperienceService } from '../../services/experience.service';
import { EducationService } from '../../services/education.service';
import { SkillService } from '../../services/skill.service';
import { PortfolioService } from '../../services/portfolio.service';

@Component({
  selector: 'app-resume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resume.component.html',
  styleUrl: './resume.component.scss'
})
export class ResumeComponent implements OnInit {
  profile: any = null;
  experiences: any[] = [];
  education: any[] = [];
  skills: any[] = [];
  portfolios: any[] = [];
  loading = false;

  constructor(
    private profileService: ProfileService,
    private experienceService: ExperienceService,
    private educationService: EducationService,
    private skillService: SkillService,
    private portfolioService: PortfolioService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loading = true;
    
    // Load Profile
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.profile = response.data;
        console.log('✅ Profile loaded:', this.profile);
      },
      error: (error) => console.error('❌ Error loading profile:', error)
    });

    // Load Experiences
    this.experienceService.getAllExperiences().subscribe({
      next: (response) => {
        this.experiences = response.data;
        console.log('✅ Experiences loaded:', this.experiences.length);
      },
      error: (error) => console.error('❌ Error loading experiences:', error)
    });

    // Load Education
    this.educationService.getAllEducation().subscribe({
      next: (response) => {
        this.education = response.data;
        console.log('✅ Education loaded:', this.education.length);
      },
      error: (error) => console.error('❌ Error loading education:', error)
    });

    // Load Skills
    this.skillService.getAllSkills().subscribe({
      next: (response) => {
        this.skills = response.data;
        console.log('✅ Skills loaded:', this.skills.length);
      },
      error: (error) => console.error('❌ Error loading skills:', error)
    });

    // Load Portfolio Projects
    this.portfolioService.getAllPortfolios().subscribe({
      next: (response) => {
        this.portfolios = response.data;
        this.loading = false;
        console.log('✅ Portfolios loaded:', this.portfolios.length);
      },
      error: (error) => {
        console.error('❌ Error loading portfolios:', error);
        this.loading = false;
      }
    });
  }

  getSkillsByCategory(category: string) {
    return this.skills.filter(skill => skill.category === category);
  }

  formatDate(date: any): string {
    if (!date) return 'Present';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }
}
