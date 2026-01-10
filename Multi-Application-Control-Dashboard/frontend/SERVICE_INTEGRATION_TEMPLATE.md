# 📋 SERVICE INTEGRATION TEMPLATE

## Standard Service Pattern

Use this template for creating new services that work with Signal Store:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ===== INTERFACES =====
export interface Item {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ItemsResponse {
  data: Item[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ItemFilters {
  searchQuery?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// ===== SERVICE =====
@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = '/api/items';

  constructor(private http: HttpClient) { }

  /**
   * Get items with filters
   * @param filters - Optional filters
   * @returns Observable<ItemsResponse>
   */
  getItems(filters?: ItemFilters): Observable<ItemsResponse> {
    let params = new HttpParams();

    if (filters?.searchQuery) {
      params = params.set('search', filters.searchQuery);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.page) {
      params = params.set('page', filters.page.toString());
    }
    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ItemsResponse>(this.apiUrl, { params });
  }

  /**
   * Get single item by ID
   * @param id - Item ID
   * @returns Observable<Item>
   */
  getItemById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new item
   * @param item - Item data (without ID)
   * @returns Observable<Item>
   */
  createItem(item: Omit<Item, 'id'>): Observable<Item> {
    return this.http.post<Item>(this.apiUrl, item);
  }

  /**
   * Update existing item
   * @param id - Item ID
   * @param item - Partial item data
   * @returns Observable<Item>
   */
  updateItem(id: string, item: Partial<Item>): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/${id}`, item);
  }

  /**
   * Delete item
   * @param id - Item ID
   * @returns Observable<void>
   */
  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Batch update items
   * @param updates - Array of updates
   * @returns Observable<Item[]>
   */
  batchUpdate(updates: Array<{ id: string; changes: Partial<Item> }>): Observable<Item[]> {
    return this.http.put<Item[]>(`${this.apiUrl}/batch`, { updates });
  }

  /**
   * Batch delete items
   * @param ids - Array of item IDs
   * @returns Observable<void>
   */
  batchDelete(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batch-delete`, { ids });
  }
}
```

---

## Service Implementation Checklist

- [ ] Service is `@Injectable({ providedIn: 'root' })`
- [ ] Service uses `HttpClient` for HTTP calls
- [ ] All methods return `Observable<T>`
- [ ] Methods have JSDoc comments with `@param` and `@returns`
- [ ] Filters are passed as objects, not multiple params
- [ ] Error handling is done in store, not service
- [ ] No state management in service
- [ ] Service is stateless (pure functions)

---

## Store Integration Template

```typescript
import { Injectable, inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods } from '@ngrx/signals';
import { patchState } from '@ngrx/signals';
import { ItemService, Item, ItemsResponse } from '../services/item.service';

// ===== STATE INTERFACE =====
export interface ItemState {
  items: Item[];
  loading: boolean;
  error: string | null;
  success: string | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  searchQuery: string;
}

// ===== INITIAL STATE =====
const initialState: ItemState = {
  items: [],
  loading: false,
  error: null,
  success: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  searchQuery: ''
};

// ===== STORE =====
@Injectable({
  providedIn: 'root'
})
export class ItemStore extends signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    totalPages: computed(() => Math.ceil(state.totalItems() / state.pageSize())),
    isLoading: computed(() => state.loading()),
    isEmpty: computed(() => state.items().length === 0 && !state.loading())
  })),
  withMethods((store, itemService = inject(ItemService)) => ({
    // ===== LOAD ACTIONS =====
    loadItems(): void {
      patchState(store, { loading: true, error: null });

      const filters = {
        searchQuery: store.searchQuery() || undefined,
        page: store.currentPage(),
        limit: store.pageSize()
      };

      itemService.getItems(filters).subscribe({
        next: (response: ItemsResponse) => {
          patchState(store, {
            items: response.data,
            totalItems: response.total || 0,
            loading: false
          });
        },
        error: (err) => {
          patchState(store, {
            error: 'Failed to load items',
            loading: false
          });
          console.error('ItemStore: Error loading items', err);
        }
      });
    },

    // ===== CREATE ACTION =====
    createItem(item: Omit<Item, 'id'>): void {
      itemService.createItem(item).subscribe({
        next: () => {
          patchState(store, {
            success: 'Item created successfully!',
            error: null
          });
          setTimeout(() => patchState(store, { success: null }), 3000);
          store.loadItems();
        },
        error: (err) => {
          patchState(store, { error: 'Failed to create item' });
          console.error('ItemStore: Error creating item', err);
        }
      });
    },

    // ===== UPDATE ACTION =====
    updateItem(id: string, item: Partial<Item>): void {
      itemService.updateItem(id, item).subscribe({
        next: () => {
          patchState(store, {
            success: 'Item updated successfully!',
            error: null
          });
          setTimeout(() => patchState(store, { success: null }), 3000);
          store.loadItems();
        },
        error: (err) => {
          patchState(store, { error: 'Failed to update item' });
          console.error('ItemStore: Error updating item', err);
        }
      });
    },

    // ===== DELETE ACTION =====
    deleteItem(id: string): void {
      itemService.deleteItem(id).subscribe({
        next: () => {
          patchState(store, {
            success: 'Item deleted successfully!',
            error: null
          });
          setTimeout(() => patchState(store, { success: null }), 3000);
          store.loadItems();
        },
        error: (err) => {
          patchState(store, { error: 'Failed to delete item' });
          console.error('ItemStore: Error deleting item', err);
        }
      });
    },

    // ===== FILTER/SEARCH ACTIONS =====
    searchItems(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
      store.loadItems();
    },

    clearFilters(): void {
      patchState(store, { searchQuery: '', currentPage: 1 });
      store.loadItems();
    },

    // ===== PAGINATION ACTIONS =====
    goToPage(page: number): void {
      if (page >= 1 && page <= store.totalPages()) {
        patchState(store, { currentPage: page });
        store.loadItems();
      }
    }
  }))
) {}
```

---

## Component Integration Template

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ItemStore } from '../../../core/store/item.store';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.scss']
})
export class ItemListComponent implements OnInit {
  // ===== INJECT STORE =====
  readonly itemStore = inject(ItemStore);
  private fb = inject(FormBuilder);

  // ===== LOCAL UI STATE =====
  showForm = false;
  isEditing = false;
  itemForm: FormGroup;

  constructor() {
    this.itemForm = this.fb.group({
      name: ['', { validators: [Validators.required] }],
      // ... other fields
    });
  }

  ngOnInit(): void {
    // Load items from store
    this.itemStore.loadItems();
  }

  // ===== FORM ACTIONS =====
  openCreateForm(): void {
    this.isEditing = false;
    this.itemForm.reset();
    this.showForm = true;
  }

  saveItem(): void {
    if (this.itemForm.invalid) return;

    if (this.isEditing) {
      // Dispatch update action to store
      this.itemStore.updateItem(itemId, this.itemForm.value);
    } else {
      // Dispatch create action to store
      this.itemStore.createItem(this.itemForm.value);
    }

    this.showForm = false;
  }

  // ===== DELETE ACTION =====
  deleteItem(id: string): void {
    if (confirm('Are you sure?')) {
      // Dispatch delete action to store
      this.itemStore.deleteItem(id);
    }
  }

  // ===== SEARCH/FILTER ACTIONS =====
  onSearch(): void {
    this.itemStore.searchItems(this.itemStore.searchQuery());
  }

  clearFilters(): void {
    this.itemStore.clearFilters();
  }

  // ===== PAGINATION =====
  goToPage(page: number): void {
    this.itemStore.goToPage(page);
  }
}
```

**Template:**
```html
<!-- Loading state -->
<div *ngIf="itemStore.isLoading()">Loading...</div>

<!-- Success/Error messages -->
<div *ngIf="itemStore.success()">{{ itemStore.success() }}</div>
<div *ngIf="itemStore.error()">{{ itemStore.error() }}</div>

<!-- Search -->
<input [(ngModel)]="itemStore.searchQuery()"
       (keyup)="onSearch()">

<!-- Item list -->
<div *ngFor="let item of itemStore.items()">
  <h3>{{ item.name }}</h3>
  <button (click)="deleteItem(item.id)">Delete</button>
</div>

<!-- Pagination -->
<button *ngFor="let page of [1,2,3]"
        (click)="goToPage(page)">
  {{ page }}
</button>
```

---

## Validation Checklist

After creating a new store/service/component combo:

- [ ] Service methods return Observable<T>
- [ ] Service has no state management
- [ ] Store has all CRUD operations
- [ ] Store has all filter/search operations
- [ ] Store has computed signals for UI
- [ ] Store handles errors and success messages
- [ ] Component injects store via `inject()`
- [ ] Component calls store methods (no HTTP)
- [ ] Component reads from store signals
- [ ] Template binds to store signals
- [ ] No manual subscriptions in component
- [ ] No OnDestroy cleanup needed

---

## Common Mistakes to Avoid

### ❌ Service with state
```typescript
// WRONG!
export class ItemService {
  items: Item[] = [];  // DON'T DO THIS
  
  getItems() {
    this.items = response.data;  // WRONG
  }
}
```

### ✅ Stateless service
```typescript
// CORRECT!
export class ItemService {
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(url);
  }
}
```

### ❌ Component with HTTP
```typescript
// WRONG!
export class ItemComponent {
  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.http.get(url).subscribe(...);  // DON'T DO THIS
  }
}
```

### ✅ Component with store
```typescript
// CORRECT!
export class ItemComponent {
  readonly store = inject(ItemStore);
  
  ngOnInit() {
    this.store.loadItems();  // CORRECT
  }
}
```

---

## Quick Copy-Paste

### New Store Creation
1. Copy service template → Customize for your entity
2. Copy store template → Customize for your entity
3. Copy component template → Customize for your entity
4. Update imports and types
5. Test in component

### Store Methods Pattern
```typescript
// Every CRUD operation follows this pattern:
someAction(params): void {
  // 1. Update loading state
  patchState(store, { loading: true, error: null });

  // 2. Call service
  service.someMethod(params).subscribe({
    // 3. Handle success
    next: (response) => {
      patchState(store, { 
        data: response,
        success: 'Success message!',
        loading: false
      });
      setTimeout(() => patchState(store, { success: null }), 3000);
      store.loadData();  // Refresh if needed
    },
    // 4. Handle error
    error: (err) => {
      patchState(store, {
        error: 'Error message',
        loading: false
      });
      console.error('Error:', err);
    }
  });
}
```

---

## Testing Template

```typescript
describe('ItemStore', () => {
  let store: ItemStore;
  let mockService: jasmine.SpyObj<ItemService>;

  beforeEach(() => {
    mockService = jasmine.createSpyObj('ItemService', [
      'getItems',
      'createItem',
      'updateItem',
      'deleteItem'
    ]);

    TestBed.overrideProvider(ItemService, {
      useValue: mockService
    });

    store = TestBed.inject(ItemStore);
  });

  it('should load items', (done) => {
    mockService.getItems.and.returnValue(
      of({ data: [{ id: '1', name: 'Test' }], total: 1 })
    );

    store.loadItems();

    expect(store.items()).toEqual([{ id: '1', name: 'Test' }]);
    done();
  });
});
```

This is your complete reference for maintaining consistency across all stores, services, and components! 🎯
