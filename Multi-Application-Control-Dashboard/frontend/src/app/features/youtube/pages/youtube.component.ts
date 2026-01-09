import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './youtube.component.html',  // ✅ SEPARATE FILE
  styleUrls: ['./youtube.component.scss']   // ✅ SEPARATE FILE
})
export class YouTubeComponent implements OnInit {
  youtubeForm: FormGroup;
  showForm = false;
  isSubmitting = false;
  editingId: string | null = null;
  posts$ = this.http.get<any[]>('http://localhost:3000/api/youtube');

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.youtubeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      videoUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      thumbnailUrl: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      category: [''],
      tags: [''],
      published: [false]
    });
  }

  ngOnInit(): void {}

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.youtubeForm.reset();
      this.editingId = null;
    }
  }

  submitForm(): void {
    if (this.youtubeForm.valid) {
      this.isSubmitting = true;
      const formData = {
        ...this.youtubeForm.value,
        tags: this.youtubeForm.value.tags.split(',').map((t: string) => t.trim())
      };

      const request = this.editingId
        ? this.http.put(`http://localhost:3000/api/youtube/${this.editingId}`, formData)
        : this.http.post('http://localhost:3000/api/youtube', formData);

      request.subscribe({
        next: () => {
          this.isSubmitting = false;
          this.youtubeForm.reset();
          this.showForm = false;
          this.editingId = null;
          this.posts$ = this.http.get<any[]>('http://localhost:3000/api/youtube');
        },
        error: (err) => {
          this.isSubmitting = false;
          console.error('Error saving post:', err);
        }
      });
    }
  }

  editPost(post: any): void {
    this.editingId = post.id;
    this.youtubeForm.patchValue({
      ...post,
      tags: post.tags?.join(', ') || ''
    });
    this.showForm = true;
  }

  deletePost(id: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.http.delete(`http://localhost:3000/api/youtube/${id}`).subscribe({
        next: () => {
          this.posts$ = this.http.get<any[]>('http://localhost:3000/api/youtube');
        },
        error: (err) => console.error('Error deleting post:', err)
      });
    }
  }
}
