import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HasPermissionDirective, HasRoleDirective, AuthDisabledDirective, HasPermissionPipe } from '../../../core/directives';
import { RoleType } from '../../../core/models/role.model';

@Component({
  selector: 'app-auth-demo',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    HasPermissionDirective,
    HasRoleDirective,
    AuthDisabledDirective,
    HasPermissionPipe
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h2 class="text-2xl font-bold mb-6 text-gray-800">Authorization Directives Demo</h2>
      
      <!-- Role-based content -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4 text-gray-700">Role-based Visibility (*appHasRole)</h3>
        
        <div *appHasRole="[RoleType.SUPER_ADMIN]" class="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-3">
          🔴 Super Admin Content Only
        </div>
        
        <div *appHasRole="[RoleType.ADMIN, RoleType.SUPER_ADMIN]" class="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-3">
          🔵 Admin/Super Admin Content
        </div>
        
        <div *appHasRole="[RoleType.NORMAL_USER]" class="bg-green-100 border-l-4 border-green-500 p-4 rounded mb-3">
          🟢 Normal User Content
        </div>
        
        <div *appHasRole="[RoleType.VIEWER]" class="bg-gray-100 border-l-4 border-gray-500 p-4 rounded mb-3">
          ⚪ Viewer Content (Read-only)
        </div>
      </div>

      <!-- Permission-based buttons -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4 text-gray-700">Permission-based Actions (appAuthDisabled)</h3>
        
        <div class="flex flex-wrap gap-3">
          <button 
            appAuthDisabled="Blog" 
            appAuthDisabledAction="create"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            Create Blog Post
          </button>
          
          <button 
            appAuthDisabled="YouTube" 
            appAuthDisabledAction="edit"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
            Edit YouTube Video
          </button>
          
          <button 
            appAuthDisabled="Study Notes" 
            appAuthDisabledAction="delete"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
            Delete Study Note
          </button>
          
          <button 
            appAuthDisabled="Profile" 
            appAuthDisabledAction="edit"
            class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      <!-- Conditional rendering with pipes -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold mb-4 text-gray-700">Pipe-based Conditional Rendering (hasPermission)</h3>
        
        <div class="space-y-3">
          <div *ngIf="'Blog' | hasPermission:'create'" class="bg-yellow-100 border border-yellow-200 p-3 rounded flex items-center">
            <span class="text-green-600 mr-2">✅</span>
            You can create blog posts
          </div>
          
          <div *ngIf="!('Blog' | hasPermission:'create')" class="bg-red-100 border border-red-200 p-3 rounded flex items-center">
            <span class="text-red-600 mr-2">❌</span>
            You cannot create blog posts
          </div>
          
          <div *ngIf="'Profile' | hasPermission:'edit'" class="bg-green-100 border border-green-200 p-3 rounded flex items-center">
            <span class="text-green-600 mr-2">✅</span>
            You can edit your profile
          </div>
          
          <div *ngIf="!('Profile' | hasPermission:'edit')" class="bg-orange-100 border border-orange-200 p-3 rounded flex items-center">
            <span class="text-orange-600 mr-2">⚠️</span>
            Profile editing restricted
          </div>
        </div>
      </div>

      <!-- Module access indicators -->
      <div>
        <h3 class="text-xl font-semibold mb-4 text-gray-700">Module Access Status</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-gray-200 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Blog Module</h4>
            <span [class]="'px-3 py-1 rounded-full text-sm font-medium ' + (hasModuleAccess('Blog') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
              {{ hasModuleAccess('Blog') ? '✅ Access Granted' : '❌ Access Denied' }}
            </span>
          </div>
          
          <div class="border border-gray-200 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">YouTube Module</h4>
            <span [class]="'px-3 py-1 rounded-full text-sm font-medium ' + (hasModuleAccess('YouTube') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
              {{ hasModuleAccess('YouTube') ? '✅ Access Granted' : '❌ Access Denied' }}
            </span>
          </div>
          
          <div class="border border-gray-200 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Profile Module</h4>
            <span [class]="'px-3 py-1 rounded-full text-sm font-medium ' + (hasModuleAccess('Profile') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
              {{ hasModuleAccess('Profile') ? '✅ Access Granted' : '❌ Access Denied' }}
            </span>
          </div>
          
          <div class="border border-gray-200 p-4 rounded-lg">
            <h4 class="font-medium text-gray-800 mb-2">Settings Module</h4>
            <span [class]="'px-3 py-1 rounded-full text-sm font-medium ' + (hasModuleAccess('Settings') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')">
              {{ hasModuleAccess('Settings') ? '✅ Access Granted' : '❌ Access Denied' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthDemoComponent {
  RoleType = RoleType;
  
  // No service injection needed for this demo component
  
  hasModuleAccess(module: string): boolean {
    // This would normally use the actual permission service
    // For demo purposes, we're simulating the check
    return true; // In real implementation, this would call the service
  }
}