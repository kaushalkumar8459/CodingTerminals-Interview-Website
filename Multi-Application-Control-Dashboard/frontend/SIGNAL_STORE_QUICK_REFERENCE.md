# 🚀 SIGNAL STORE QUICK REFERENCE

## Component Usage Cheat Sheet

### 1. Inject Store
```typescript
readonly store = inject(BlogStore);    // BlogStore
readonly store = inject(UserStore);    // UserStore
readonly store = inject(ModuleStore);  // ModuleStore
```

### 2. Load Data
```typescript
ngOnInit() {
  this.store.loadPosts();    // BlogStore
  this.store.loadUsers();    // UserStore
  this.store.loadModules();  // ModuleStore
}
```

### 3. Read State in Template
```html
<!-- Reading signals (functions that return current value) -->
<div *ngIf="store.isLoading()">Loading...</div>
<div *ngFor="let item of store.posts()">{{ item.title }}</div>
<p>{{ store.totalPages() }}</p>
<p *ngIf="store.isEmpty()">No data</p>
```

### 4. Dispatch Actions
```typescript
// Blog actions
store.loadPosts();
store.filterByStatus('published');
store.publishPost(id);
store.unpublishPost(id);
store.deletePost(id);

// User actions
store.loadUsers();
store.createUser(userData);
store.updateUser(id, userData);
store.deleteUser(id);
store.assignModules(userId, modules);

// Module actions
store.loadModules();
store.toggleModule(module);
store.saveModuleChanges();
store.resetChanges();
```

### 5. Handle Responses
```typescript
// Store automatically handles:
// ✅ Loading state
// ✅ Success messages
// ✅ Error messages
// ✅ State updates
// ✅ Pagination
// ✅ Filtering

// Just dispatch and forget!
store.createUser(data);  // Store handles everything
store.deletePost(id);    // Store handles everything
```

---

## Store Structure Template

```typescript
@Injectable({ providedIn: 'root' })
export class XyzStore extends signalStore(
  { providedIn: 'root' },
  
  // 1. Initial state
  withState(initialState),
  
  // 2. Computed signals (derived state)
  withComputed((state) => ({
    computed1: computed(() => state.value() > 10),
    computed2: computed(() => state.items().length)
  })),
  
  // 3. Methods/Actions
  withMethods((store, service = inject(XyzService)) => ({
    // Load data
    loadData(): void {
      patchState(store, { loading: true });
      service.getData().subscribe({
        next: (data) => {
          patchState(store, { items: data, loading: false });
        },
        error: () => {
          patchState(store, { error: 'Failed', loading: false });
        }
      });
    },
    
    // Create/Update/Delete
    create(item: Item): void {
      service.create(item).subscribe({
        next: (newItem) => {
          patchState(store, {
            items: [...store.items(), newItem],
            success: 'Created!'
          });
          store.loadData();
        },
        error: () => {
          patchState(store, { error: 'Failed to create' });
        }
      });
    }
  }))
) {}
```

---

## ✅ CHECKLIST: Zero API Calls in Components

- [ ] All HTTP calls are in **Services** (e.g., `BlogService`, `UserService`)
- [ ] All state is in **Stores** (e.g., `BlogStore`, `UserStore`)
- [ ] Components **inject stores** via `inject()`
- [ ] Components **call store methods** to dispatch actions
- [ ] Components **bind to store signals** in templates
- [ ] Components have **NO `.subscribe()` to services**
- [ ] Components have **NO direct HTTP calls**
- [ ] Components have **NO manual state management**
- [ ] Components have **NO OnDestroy cleanup**
- [ ] Error/Success messages are in **store state**

---

## 🎯 Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│  COMPONENT LAYER (Thin)                 │
│  • UI interactions                      │
│  • Inject store                         │
│  • Call store methods                   │
│  • Bind to store signals                │
│  • NO API calls                         │
└─────────────────────────────────────────┘
              ↕ Dispatch/Read
┌─────────────────────────────────────────┐
│  STORE LAYER (State Management)         │
│  • signalStore()                        │
│  • withState()                          │
│  • withComputed()                       │
│  • withMethods() - Contains API calls   │
│  • patchState()                         │
└─────────────────────────────────────────┘
              ↕ inject() service
┌─────────────────────────────────────────┐
│  SERVICE LAYER (API)                    │
│  • HttpClient                           │
│  • Observable<T>                        │
│  • Error handling                       │
│  • Interceptors                         │
└─────────────────────────────────────────┘
              ↕ HTTP
┌─────────────────────────────────────────┐
│  BACKEND (REST API)                     │
└─────────────────────────────────────────┘
```

---

## 🧪 Testing Without API

```typescript
// Component doesn't need HTTP mock anymore!
describe('BlogListComponent', () => {
  it('loads posts on init', () => {
    // Just mock the store
    const mockStore = {
      loadPosts: jasmine.createSpy(),
      posts: signal([]),
      isLoading: signal(false)
    };
    
    component.store = mockStore;
    component.ngOnInit();
    
    expect(mockStore.loadPosts).toHaveBeenCalled();
  });
});
```

---

## 📊 State Flow Diagram

```
User clicks button
         ↓
Component method called
         ↓
Store action dispatched
         ↓
Store injects service
         ↓
Service makes HTTP call
         ↓
Backend responds
         ↓
Store handles response
         ↓
patchState() updates state
         ↓
Signal signals update
         ↓
Component template re-renders
         ↓
User sees result
```

---

## 🎓 Key Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **Signal** | Reactive value holder | `posts()` returns current value |
| **Computed Signal** | Derived from other signals | `totalPages()` computed from state |
| **patchState()** | Update store state immutably | `patchState(store, { loading: false })` |
| **withMethods()** | Store actions with API calls | `loadPosts()`, `createUser()` |
| **inject()** | Dependency injection in store | `inject(BlogService)` |

---

## 🔴 Anti-Patterns (DO NOT DO)

```typescript
// ❌ WRONG: API call in component
constructor(private service: BlogService) {}
ngOnInit() {
  this.service.getPosts().subscribe(data => {
    this.posts = data;
  });
}

// ❌ WRONG: Manual state management
export class BlogComponent {
  posts: Post[] = [];
  loading = false;
  error: string | null = null;
  // ... lots of manual logic
}

// ❌ WRONG: Multiple subscriptions
ngOnInit() {
  this.service.getPosts().subscribe(...);
  this.service.getComments().subscribe(...);
  this.service.getMetadata().subscribe(...);
}

// ❌ WRONG: Subscription cleanup boilerplate
private destroy$ = new Subject();
ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## ✅ Best Patterns (DO THIS)

```typescript
// ✅ RIGHT: API call in store
export class BlogStore extends signalStore(
  withMethods((store, service = inject(BlogService)) => ({
    loadPosts(): void {
      service.getPosts().subscribe(data => {
        patchState(store, { posts: data });
      });
    }
  }))
) {}

// ✅ RIGHT: Minimal component
export class BlogComponent {
  readonly store = inject(BlogStore);
  
  ngOnInit() {
    this.store.loadPosts();
  }
}

// ✅ RIGHT: Clean template
<div *ngIf="store.isLoading()">Loading...</div>
<div *ngFor="let post of store.posts()">{{ post.title }}</div>

// ✅ RIGHT: No cleanup needed (signals handle it)
ngOnDestroy() {
  // Signals clean up automatically
}
```

---

## 📁 File Structure

```
core/
├── store/
│   ├── blog.store.ts           ✅ BlogStore
│   ├── user.store.ts           ✅ UserStore
│   ├── module.store.ts         ✅ ModuleStore
│   └── youtube.store.ts        (TODO)
│
├── services/
│   ├── blog.service.ts         ✅ Has API calls
│   ├── user.service.ts         ✅ Has API calls
│   ├── module.service.ts       ✅ Has API calls
│   ├── toast.service.ts        ✅ Toast notifications
│   └── youtube.service.ts      (TODO)
│
└── interceptors/
    ├── auth.interceptor.ts     ✅ JWT token
    └── error.interceptor.ts    ✅ Error handling

features/
├── blog/
│   └── blog-list/
│       └── blog-list.component.ts        ✅ Uses BlogStore
│
├── admin/
│   ├── user-management/
│   │   └── user-management.component.ts  ✅ Uses UserStore
│   └── module-settings/
│       └── module-settings.component.ts  ✅ Uses ModuleStore
│
└── [other modules...]
```

---

## ✨ Implementation Complete

✅ **BlogStore** - Full CRUD with publish/unpublish
✅ **UserStore** - Full CRUD with roles & modules
✅ **ModuleStore** - Toggle with change tracking
✅ **BlogListComponent** - Uses BlogStore
✅ **UserManagementComponent** - Uses UserStore
✅ **ModuleSettingsComponent** - Uses ModuleStore
✅ **ZERO API calls in components**
✅ **Centralized state management**
✅ **Production-ready code**

The architecture is now clean, maintainable, and follows Angular best practices! 🎉
