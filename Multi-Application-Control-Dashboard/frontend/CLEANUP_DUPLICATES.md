# CLEANUP INSTRUCTION - DELETE THESE FILES

Delete the following duplicate/incorrect files from:
`frontend/src/app/features/youtube/`

## Files to DELETE:
1. ❌ youtube-list.component.ts (at root level - has inline template)
2. ❌ youtube.component.ts (duplicate - don't use)
3. ❌ youtube.component.html (orphaned file - not referenced)
4. ❌ youtube.component.scss (orphaned file - not referenced)

## Files to KEEP:
1. ✅ pages/youtube-list/youtube-list.component.ts (CORRECT)
2. ✅ pages/youtube-list/youtube-list.component.html (CORRECT)
3. ✅ pages/youtube-list/youtube-list.component.scss (CORRECT)
4. ✅ youtube.routes.ts (CORRECT - already fixed)
5. ✅ services/youtube.service.ts (CORRECT)

## Why?
- The proper component is in `pages/youtube-list/`
- Root-level files are duplicates and cause confusion
- Routes now correctly point to `pages/youtube-list/youtube-list.component`

## After deletion, structure should be:
```
youtube/
├── pages/
│   └── youtube-list/
│       ├── youtube-list.component.ts
│       ├── youtube-list.component.html
│       └── youtube-list.component.scss
├── components/
├── services/
│   └── youtube.service.ts
└── youtube.routes.ts
```

NO duplicate files ✅
NO inline templates ✅
NO inline styles ✅
PROPER SEPARATION OF CONCERNS ✅
