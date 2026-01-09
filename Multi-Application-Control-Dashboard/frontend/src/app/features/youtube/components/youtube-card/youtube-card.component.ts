import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-youtube-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './youtube-card.component.html',
  styleUrls: ['./youtube-card.component.scss']
})
export class YouTubeCardComponent {
  @Input() post: any;
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<string>();

  onEdit(): void {
    this.edit.emit(this.post);
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.delete.emit(this.post._id);
    }
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      published: 'badge-published',
      draft: 'badge-draft',
      scheduled: 'badge-scheduled'
    };
    return classes[status] || 'badge-default';
  }
}
