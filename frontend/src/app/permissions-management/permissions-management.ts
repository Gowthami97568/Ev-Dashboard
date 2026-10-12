import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Sidebar } from '../dashboard/components/sidebar/sidebar';
import { Topbar } from '../dashboard/components/topbar/topbar';
import {
  PERMISSION_OPTIONS,
  PermissionsService,
  UserPermissionRow
} from '../services/permissions.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-permissions-management',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, Topbar],
  templateUrl: './permissions-management.html',
  styleUrl: './permissions-management.css'
})
export class PermissionsManagement implements OnInit {
  readonly permissionOptions = PERMISSION_OPTIONS;
  rows: UserPermissionRow[] = [];
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';
  editingUserId = '';
  permissions: string[] = [];
  newUserId = '';

  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get canManage(): boolean {
    return this.permissionsService.hasAccess('settings', 'allow');
  }

  ngOnInit(): void {
    this.loadPermissions();
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/login');
  }

  loadPermissions(): void {
    this.loading = true;
    this.errorMessage = '';
    this.permissionsService.loadPermissionRows().subscribe({
      next: response => {
        this.rows = response.data;
        this.loading = false;
      },
      error: error => {
        console.error('Failed to load permission rows:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.loading = false;
      }
    });
  }

  startEdit(row: UserPermissionRow): void {
    this.editingUserId = row.UserId;
    this.permissions = this.permissionsService.getPermissionTags(row.UserId);
    this.newUserId = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  startCreate(): void {
    const userId = this.newUserId.trim();
    if (!userId) {
      this.errorMessage = 'Enter a User ID to assign permissions.';
      return;
    }

    this.editingUserId = userId;
    this.permissions = [];
    this.newUserId = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editingUserId = '';
    this.permissions = [];
  }

  togglePermission(permission: string): void {
    if (permission === 'allow:All') {
      this.permissions = this.permissions.includes(permission) ? [] : [permission];
      return;
    }

    this.permissions = this.permissions.filter(item => item !== 'allow:All');
    this.permissions = this.permissions.includes(permission)
      ? this.permissions.filter(item => item !== permission)
      : [...this.permissions, permission];
  }

  savePermissions(): void {
    if (!this.canManage || !this.editingUserId || this.saving) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.permissionsService.savePermissions(this.editingUserId, this.permissions).subscribe({
      next: response => {
        this.rows = this.rows.filter(
          row => row.UserId.toLowerCase() !== response.data.UserId.toLowerCase()
        );
        this.rows = [...this.rows, response.data].sort((a, b) =>
          a.UserId.localeCompare(b.UserId)
        );
        this.saving = false;
        this.successMessage = `Permissions saved for ${response.data.UserId}.`;
        this.cancelEdit();
      },
      error: error => {
        console.error('Failed to save permissions:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.saving = false;
      }
    });
  }

  getPermissionTags(row: UserPermissionRow): string[] {
    return this.permissionsService.normalizePermissions(
      row.Permission_Map.split(',').filter(Boolean)
    ) || [];
  }

  permissionStyle(permission: string): string {
    return permission.startsWith('allow:') ? 'permission-tag permission-tag--allow' : 'permission-tag permission-tag--view';
  }

  private getErrorMessage(error: { status?: number; error?: { message?: string } }): string {
    if (error.status === 401) return 'Your session has expired. Sign in again to continue.';
    if (error.status === 403) return 'Your account is not authorized to manage permissions.';
    if (error.status === 0) return 'The permissions API could not be reached. Check that the backend is running and the API URL is correct.';
    return error.error?.message || 'Unable to load or save permissions. Please try again.';
  }
}
