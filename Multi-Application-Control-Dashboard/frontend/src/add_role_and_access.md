Universal Pattern for Adding Authorization Directives
Here's the universal pattern you can apply to any standalone component:
Step 1: Import the directives
typescript
import { HasRoleDirective, HasPermissionDirective, AuthDisabledDirective, HasPermissionPipe } from '../../core/directives';
import { RoleType } from '../../core/models/role.model';
Step 2: Add to component imports
typescript
@Component({
  // ... other properties
  imports: [
    // ... existing imports
    HasRoleDirective,
    HasPermissionDirective,
    AuthDisabledDirective,
    HasPermissionPipe
  ]
})
Step 3: Add RoleType to component class
typescript
export class YourComponent {
  RoleType = RoleType;
  // ... rest of your component
}
5. Common Usage Examples
Here are common ways to use the directives in templates:
Role-based visibility:
html
<!-- Show only to Super Admins -->
<div *appHasRole="[RoleType.SUPER_ADMIN]">
  Super Admin exclusive content
</div>

<!-- Show to Admins and Super Admins -->
<div *appHasRole="[RoleType.ADMIN, RoleType.SUPER_ADMIN]">
  Admin panel
</div>

<!-- Show only to Normal Users -->
<div *appHasRole="[RoleType.NORMAL_USER]">
  User-specific content
</div>
Permission-based actions:
html
<!-- Disable button based on permissions -->
<button 
  appAuthDisabled="Blog" 
  appAuthDisabledAction="create">
  Create Blog Post
</button>

<!-- Conditional rendering with pipes -->
<button [disabled]="!('Profile' | hasPermission:'edit')">
  Edit Profile
</button>

<!-- Show/hide based on module permissions -->
<div *appHasPermission="'YouTube'; action: 'edit'">
  YouTube editing tools
</div>
The authorization directives are now ready to be added to any component in your Angular 21 application. Simply follow the pattern above for each component where you need role-based UI control or permission checking.
