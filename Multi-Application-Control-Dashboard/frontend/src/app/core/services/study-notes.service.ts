import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CreateStudyNoteRequest, UpdateStudyNoteRequest, StudyNote } from '../store/study-notes.store';

@Injectable({ providedIn: 'root' })
export class StudyNotesService {
  private apiUrl = environment.apiUrl + '/study-notes';

  constructor(private http: HttpClient) {}

  getNotes(params?: any): Observable<StudyNote[]> {
    return this.http.get<StudyNote[]>(this.apiUrl, { params });
  }

  getNoteById(id: string): Observable<StudyNote> {
    return this.http.get<StudyNote>(`${this.apiUrl}/${id}`);
  }

  createNote(data: CreateStudyNoteRequest): Observable<StudyNote> {
    return this.http.post<StudyNote>(this.apiUrl, data);
  }

  updateNote(id: string, data: UpdateStudyNoteRequest): Observable<StudyNote> {
    return this.http.put<StudyNote>(`${this.apiUrl}/${id}`, data);
  }

  deleteNote(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
