import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../services/portfolio.service';
import { ProfileService } from '../../services/profile.service';
import { ExperienceService } from '../../services/experience.service';
import { EducationService } from '../../services/education.service';
import { SkillService } from '../../services/skill.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  // Active Tab
  activeTab: 'profile' | 'portfolio' | 'experience' | 'education' | 'skills' = 'profile';
  
  // Portfolio Data
  portfolios: any[] = [];
  loading = false;
  stats: any = null;
  showForm = false;
  editMode = false;
  
  // Resume Data
  profile: any = null;
  experiences: any[] = [];
  education: any[] = [];
  skills: any[] = [];
  
  formData: any = {
    title: '',
    description: '',
    category: 'Web Development',
    technologies: [],
    imageUrl: '',
    projectUrl: '',
    githubUrl: '',
    status: 'completed',
    featured: false,
    order: 0
  };
  
  // Profile Form
  profileForm: any = {
    resumeType: 'modern',
    fullName: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    profileImage: '',
    resumePdfUrl: '',
    socialLinks: {
      youtube: '',
      linkedin: '',
      github: '',
      twitter: '',
      instagram: '',
      portfolio: ''
    },
    summary: '',
    yearsOfExperience: 0,
    availableForWork: true,
    theme: {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2'
    }
  };
  
  // Experience Form
  experienceForm: any = {
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    responsibilities: [],
    technologies: [],
    companyLogo: ''
  };
  
  // Education Form
  educationForm: any = {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    grade: '',
    description: '',
    achievements: [],
    institutionLogo: ''
  };
  
  // Skill Form
  skillForm: any = {
    name: '',
    category: 'Frontend',
    proficiency: 50,
    yearsOfExperience: 0,
    icon: '',
    color: '#667eea'
  };
  
  currentEditId: string | null = null;
  techInput = '';
  respInput = '';
  achievementInput = '';

  constructor(
    private portfolioService: PortfolioService,
    private profileService: ProfileService,
    private experienceService: ExperienceService,
    private educationService: EducationService,
    private skillService: SkillService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  // ==================== Load All Data ====================
  
  loadAllData() {
    this.loadProfile();
    this.loadPortfolios();
    this.loadStats();
    this.loadExperiences();
    this.loadEducation();
    this.loadSkills();
  }

  // ==================== Profile Operations ====================
  
  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (response) => {
        this.profile = response.data;
        this.profileForm = { ...this.profile };
        console.log('✅ Profile loaded');
      },
      error: (error) => console.error('❌ Error loading profile:', error)
    });
  }

  saveProfile() {
    this.loading = true;
    this.profileService.updateProfile(this.profileForm).subscribe({
      next: (response) => {
        console.log('✅ Profile saved:', response);
        alert('Profile updated successfully!');
        this.loadProfile();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error saving profile:', error);
        alert('Failed to save profile: ' + (error.error?.error || error.message));
        this.loading = false;
      }
    });
  }

  // ==================== Experience Operations ====================
  
  loadExperiences() {
    this.experienceService.getAllExperiences().subscribe({
      next: (response) => {
        this.experiences = response.data;
        console.log('✅ Experiences loaded:', this.experiences.length);
      },
      error: (error) => console.error('❌ Error loading experiences:', error)
    });
  }

  openExperienceForm(experience?: any) {
    if (experience) {
      this.experienceForm = { ...experience };
      this.currentEditId = experience._id;
      this.editMode = true;
    } else {
      this.resetExperienceForm();
      this.editMode = false;
    }
    this.showForm = true;
  }

  saveExperience() {
    this.loading = true;
    
    if (this.editMode && this.currentEditId) {
      this.experienceService.updateExperience(this.currentEditId, this.experienceForm).subscribe({
        next: (response) => {
          alert('Experience updated successfully!');
          this.loadExperiences();
          this.closeForm();
          this.loading = false;
        },
        error: (error) => {
          alert('Failed to update experience');
          this.loading = false;
        }
      });
    } else {
      this.experienceService.createExperience(this.experienceForm).subscribe({
        next: (response) => {
          alert('Experience created successfully!');
          this.loadExperiences();
          this.closeForm();
          this.loading = false;
        },
        error: (error) => {
          alert('Failed to create experience');
          this.loading = false;
        }
      });
    }
  }

  deleteExperience(id: string) {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    
    this.experienceService.deleteExperience(id).subscribe({
      next: () => {
        alert('Experience deleted successfully!');
        this.loadExperiences();
      },
      error: (error) => alert('Failed to delete experience')
    });
  }

  // ==================== Education Operations ====================
  
  loadEducation() {
    this.educationService.getAllEducation().subscribe({
      next: (response) => {
        this.education = response.data;
        console.log('✅ Education loaded:', this.education.length);
      },
      error: (error) => console.error('❌ Error loading education:', error)
    });
  }

  openEducationForm(edu?: any) {
    if (edu) {
      this.educationForm = { ...edu };
      this.currentEditId = edu._id;
      this.editMode = true;
    } else {
      this.resetEducationForm();
      this.editMode = false;
    }
    this.showForm = true;
  }

  saveEducation() {
    this.loading = true;
    
    if (this.editMode && this.currentEditId) {
      this.educationService.updateEducation(this.currentEditId, this.educationForm).subscribe({
        next: () => {
          alert('Education updated successfully!');
          this.loadEducation();
          this.closeForm();
          this.loading = false;
        },
        error: () => {
          alert('Failed to update education');
          this.loading = false;
        }
      });
    } else {
      this.educationService.createEducation(this.educationForm).subscribe({
        next: () => {
          alert('Education created successfully!');
          this.loadEducation();
          this.closeForm();
          this.loading = false;
        },
        error: () => {
          alert('Failed to create education');
          this.loading = false;
        }
      });
    }
  }

  deleteEducation(id: string) {
    if (!confirm('Are you sure you want to delete this education?')) return;
    
    this.educationService.deleteEducation(id).subscribe({
      next: () => {
        alert('Education deleted successfully!');
        this.loadEducation();
      },
      error: () => alert('Failed to delete education')
    });
  }

  // ==================== Skills Operations ====================
  
  loadSkills() {
    this.skillService.getAllSkills().subscribe({
      next: (response) => {
        this.skills = response.data;
        console.log('✅ Skills loaded:', this.skills.length);
      },
      error: (error) => console.error('❌ Error loading skills:', error)
    });
  }

  openSkillForm(skill?: any) {
    if (skill) {
      this.skillForm = { ...skill };
      this.currentEditId = skill._id;
      this.editMode = true;
    } else {
      this.resetSkillForm();
      this.editMode = false;
    }
    this.showForm = true;
  }

  saveSkill() {
    this.loading = true;
    
    if (this.editMode && this.currentEditId) {
      this.skillService.updateSkill(this.currentEditId, this.skillForm).subscribe({
        next: () => {
          alert('Skill updated successfully!');
          this.loadSkills();
          this.closeForm();
          this.loading = false;
        },
        error: () => {
          alert('Failed to update skill');
          this.loading = false;
        }
      });
    } else {
      this.skillService.createSkill(this.skillForm).subscribe({
        next: () => {
          alert('Skill created successfully!');
          this.loadSkills();
          this.closeForm();
          this.loading = false;
        },
        error: () => {
          alert('Failed to create skill');
          this.loading = false;
        }
      });
    }
  }

  deleteSkill(id: string) {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    
    this.skillService.deleteSkill(id).subscribe({
      next: () => {
        alert('Skill deleted successfully!');
        this.loadSkills();
      },
      error: () => alert('Failed to delete skill')
    });
  }

  // ==================== Portfolio Operations (existing) ====================
  
  loadPortfolios() {
    this.loading = true;
    this.portfolioService.getAllPortfolios().subscribe({
      next: (response) => {
        this.portfolios = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading portfolios:', error);
        this.loading = false;
      }
    });
  }

  loadStats() {
    this.portfolioService.getPortfolioStats().subscribe({
      next: (response) => {
        this.stats = response.data;
      },
      error: (error) => console.error('❌ Error loading stats:', error)
    });
  }

  openCreateForm() {
    this.resetForm();
    this.showForm = true;
    this.editMode = false;
  }

  createPortfolio() {
    if (!this.formData.title || !this.formData.description) {
      alert('Title and Description are required');
      return;
    }

    this.loading = true;
    this.portfolioService.createPortfolio(this.formData).subscribe({
      next: (response) => {
        alert('Portfolio created successfully!');
        this.loadPortfolios();
        this.loadStats();
        this.closeForm();
        this.loading = false;
      },
      error: (error) => {
        alert('Failed to create portfolio');
        this.loading = false;
      }
    });
  }

  openEditForm(portfolio: any) {
    this.formData = { ...portfolio };
    this.currentEditId = portfolio._id;
    this.showForm = true;
    this.editMode = true;
  }

  updatePortfolio() {
    if (!this.currentEditId) return;

    this.loading = true;
    this.portfolioService.updatePortfolio(this.currentEditId, this.formData).subscribe({
      next: (response) => {
        alert('Portfolio updated successfully!');
        this.loadPortfolios();
        this.loadStats();
        this.closeForm();
        this.loading = false;
      },
      error: (error) => {
        alert('Failed to update portfolio');
        this.loading = false;
      }
    });
  }

  deletePortfolio(portfolio: any) {
    if (!confirm(`Are you sure you want to delete "${portfolio.title}"?`)) return;

    this.loading = true;
    this.portfolioService.deletePortfolio(portfolio._id).subscribe({
      next: (response) => {
        alert('Portfolio deleted successfully!');
        this.loadPortfolios();
        this.loadStats();
        this.loading = false;
      },
      error: (error) => {
        alert('Failed to delete portfolio');
        this.loading = false;
      }
    });
  }

  // ==================== Helper Methods ====================
  
  switchTab(tab: 'profile' | 'portfolio' | 'experience' | 'education' | 'skills') {
    this.activeTab = tab;
    this.closeForm();
  }

  addTechnology() {
    if (this.techInput.trim()) {
      if (this.activeTab === 'portfolio') {
        if (!this.formData.technologies) this.formData.technologies = [];
        this.formData.technologies.push(this.techInput.trim());
      } else if (this.activeTab === 'experience') {
        if (!this.experienceForm.technologies) this.experienceForm.technologies = [];
        this.experienceForm.technologies.push(this.techInput.trim());
      }
      this.techInput = '';
    }
  }

  removeTechnology(index: number) {
    if (this.activeTab === 'portfolio') {
      this.formData.technologies.splice(index, 1);
    } else if (this.activeTab === 'experience') {
      this.experienceForm.technologies.splice(index, 1);
    }
  }

  addResponsibility() {
    if (this.respInput.trim()) {
      if (!this.experienceForm.responsibilities) this.experienceForm.responsibilities = [];
      this.experienceForm.responsibilities.push(this.respInput.trim());
      this.respInput = '';
    }
  }

  removeResponsibility(index: number) {
    this.experienceForm.responsibilities.splice(index, 1);
  }

  addAchievement() {
    if (this.achievementInput.trim()) {
      if (!this.educationForm.achievements) this.educationForm.achievements = [];
      this.educationForm.achievements.push(this.achievementInput.trim());
      this.achievementInput = '';
    }
  }

  removeAchievement(index: number) {
    this.educationForm.achievements.splice(index, 1);
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      title: '',
      description: '',
      category: 'Web Development',
      technologies: [],
      imageUrl: '',
      projectUrl: '',
      githubUrl: '',
      status: 'completed',
      featured: false,
      order: 0
    };
    this.currentEditId = null;
  }

  resetExperienceForm() {
    this.experienceForm = {
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      responsibilities: [],
      technologies: [],
      companyLogo: ''
    };
    this.currentEditId = null;
  }

  resetEducationForm() {
    this.educationForm = {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      grade: '',
      description: '',
      achievements: [],
      institutionLogo: ''
    };
    this.currentEditId = null;
  }

  resetSkillForm() {
    this.skillForm = {
      name: '',
      category: 'Frontend',
      proficiency: 50,
      yearsOfExperience: 0,
      icon: '',
      color: '#667eea'
    };
    this.currentEditId = null;
  }

  savePortfolio() {
    if (this.editMode) {
      this.updatePortfolio();
    } else {
      this.createPortfolio();
    }
  }
}
