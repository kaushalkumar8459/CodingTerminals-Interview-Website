import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModuleSettingsService, Module } from '../../../core/services/module-settings.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-module-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './module-settings.component.html',
  styleUrls: ['./module-settings.component.scss'],
})
export class ModuleSettingsComponent implements OnInit {
  private moduleService = inject(ModuleSettingsService);
  private fb = inject(FormBuilder);

  modules$: Observable<Module[]>;
  moduleForm: FormGroup;
  selectedModule: Module | null = null;
  isFormVisible = false;
  isEditing = false;
  filteredModules: Module[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  stats: any = null;

  constructor() {
    this.modules$ = this.moduleService.modules$;
    this.moduleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      enabled: [true],
      icon: [''],
      category: [''],
    });
  }

  ngOnInit(): void {
    this.loadModules();
    this.loadStats();
  }

  loadModules(): void {
    this.loading = true;
    this.moduleService.getAllModules().subscribe(
      (modules) => {
        this.filteredModules = modules;
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load modules';
        this.loading = false;
      }
    );
  }

  loadStats(): void {
    this.moduleService.getModuleStats().subscribe(
      (stats) => {
        this.stats = stats;
      },
      (error) => {
        console.error('Failed to load stats', error);
      }
    );
  }

  openForm(module?: Module): void {
    if (module) {
      this.isEditing = true;
      this.selectedModule = module;
      this.moduleForm.patchValue(module);
    } else {
      this.isEditing = false;
      this.selectedModule = null;
      this.moduleForm.reset({ enabled: true });
    }
    this.isFormVisible = true;
  }

  closeForm(): void {
    this.isFormVisible = false;
    this.moduleForm.reset();
    this.selectedModule = null;
  }

  saveModule(): void {
    if (this.moduleForm.invalid) return;

    const moduleData: Module = this.moduleForm.value;

    if (this.isEditing && this.selectedModule?.id) {
      this.moduleService.updateModule(this.selectedModule.id, moduleData).subscribe(
        () => {
          this.success = 'Module updated successfully';
          this.closeForm();
          this.loadModules();
          this.loadStats();
          setTimeout(() => (this.success = null), 3000);
        },
        (error) => {
          this.error = 'Failed to update module';
        }
      );
    } else {
      this.moduleService.createModule(moduleData).subscribe(
        () => {
          this.success = 'Module created successfully';
          this.closeForm();
          this.loadModules();
          this.loadStats();
          setTimeout(() => (this.success = null), 3000);
        },
        (error) => {
          this.error = 'Failed to create module';
        }
      );
    }
  }

  deleteModule(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.moduleService.deleteModule(id).subscribe(
        () => {
          this.success = 'Module deleted successfully';
          this.loadModules();
          this.loadStats();
          setTimeout(() => (this.success = null), 3000);
        },
        (error) => {
          this.error = 'Failed to delete module';
        }
      );
    }
  }

  enableModule(id: string): void {
    this.moduleService.enableModule(id).subscribe(
      () => {
        this.success = 'Module enabled successfully';
        this.loadModules();
        this.loadStats();
        setTimeout(() => (this.success = null), 3000);
      },
      (error) => {
        this.error = 'Failed to enable module';
      }
    );
  }

  disableModule(id: string): void {
    this.moduleService.disableModule(id).subscribe(
      () => {
        this.success = 'Module disabled successfully';
        this.loadModules();
        this.loadStats();
        setTimeout(() => (this.success = null), 3000);
      },
      (error) => {
        this.error = 'Failed to disable module';
      }
    );
  }

  toggleModule(id: string, currentState: boolean): void {
    this.moduleService.toggleModule(id, !currentState).subscribe(
      () => {
        this.success = `Module ${!currentState ? 'enabled' : 'disabled'} successfully`;
        this.loadModules();
        this.loadStats();
        setTimeout(() => (this.success = null), 3000);
      },
      (error) => {
        this.error = 'Failed to toggle module';
      }
    );
  }

  getModulesByCategory(category: string): void {
    this.loading = true;
    this.moduleService.getModulesByCategory(category).subscribe(
      (modules) => {
        this.filteredModules = modules;
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to filter modules';
        this.loading = false;
      }
    );
  }

  showAllModules(): void {
    this.loadModules();
  }

  getStatusClass(enabled: boolean): string {
    return enabled ? 'badge-success' : 'badge-secondary';
  }

  getStatusText(enabled: boolean): string {
    return enabled ? 'Enabled' : 'Disabled';
  }
}
