import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudyNotesService } from '../services/study-notes.service';

@Component({
  selector: 'app-study-notes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './study-notes.component.html',
  styleUrls: ['./study-notes.component.scss']
})
export class StudyNotesComponent implements OnInit {
  notes: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  stats = {
    total: 0,
    public_notes: 0
  };

  constructor(private studyNotesService: StudyNotesService) {}

  ngOnInit(): void {
    this.loadStudyNotes();
    this.loadStats();
  }

  loadStudyNotes(): void {
    this.studyNotesService.getNotes(10).subscribe(
      (notes: any[]) => {
        this.notes = notes || [];
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error loading study notes:', error);
        this.errorMessage = 'Failed to load study notes';
        this.isLoading = false;
      }
    );
  }

  loadStats(): void {
    this.studyNotesService.getStats().subscribe(
      (stats: any) => {
        this.stats = stats || { total: 0, public_notes: 0 };
      },
      (error: any) => {
        console.error('Error loading study notes stats:', error);
      }
    );
  }
}
