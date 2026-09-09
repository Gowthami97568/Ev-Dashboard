import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';
import { Topbar } from '../dashboard/components/topbar/topbar';

interface SettingsSnapshot {
  userName: string;
  email: string;
  emailNotifications: boolean;
  systemNotifications: boolean;
  soundNotifications: boolean;
  compactMode: boolean;
  sessionTimeout: number;
}

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  systemNotifications: true,
  soundNotifications: false,
  compactMode: false,
  sessionTimeout: 30
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-settings',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    Topbar
  ],

  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {

  // Profile
  userName = 'Ramesh Chippada';
  email = 'admin@chargehub.com';
  role = 'Administrator';

  // Notifications
  emailNotifications = DEFAULT_PREFERENCES.emailNotifications;
  systemNotifications = DEFAULT_PREFERENCES.systemNotifications;
  soundNotifications = DEFAULT_PREFERENCES.soundNotifications;

  // Appearance
  compactMode = DEFAULT_PREFERENCES.compactMode;

  // Security
  sessionTimeout = DEFAULT_PREFERENCES.sessionTimeout;

  // State
  saving = false;
  saveMessage = '';
  errorMessage = '';

  private snapshot!: SettingsSnapshot;
  private saveMessageTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.snapshot = this.captureSnapshot();
  }

  // =====================================================
  // VALIDATION
  // =====================================================

  get isNameValid(): boolean {
    return this.userName.trim().length > 0;
  }

  get isEmailValid(): boolean {
    return EMAIL_PATTERN.test(this.email.trim());
  }

  // =====================================================
  // DIRTY STATE
  // =====================================================

  get isDirty(): boolean {
    return JSON.stringify(this.captureSnapshot()) !== JSON.stringify(this.snapshot);
  }

  private captureSnapshot(): SettingsSnapshot {
    return {
      userName: this.userName,
      email: this.email,
      emailNotifications: this.emailNotifications,
      systemNotifications: this.systemNotifications,
      soundNotifications: this.soundNotifications,
      compactMode: this.compactMode,
      sessionTimeout: this.sessionTimeout
    };
  }

  // =====================================================
  // DERIVED DISPLAY
  // =====================================================

  get initials(): string {
    const parts = this.userName.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return '?';
    }

    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';

    return (first + last).toUpperCase();
  }

  // =====================================================
  // ACTIONS
  // =====================================================

  saveSettings(): void {
    this.clearMessages();

    if (!this.isNameValid) {
      this.errorMessage = "Add your name before saving.";
      return;
    }

    if (!this.isEmailValid) {
      this.errorMessage = 'Enter a valid email address before saving.';
      return;
    }

    if (this.saving || !this.isDirty) {
      return;
    }

    this.saving = true;

    // Simulates a persistence call so the button reflects real save latency.
    setTimeout(() => {
      this.saving = false;
      this.snapshot = this.captureSnapshot();
      this.showMessage('Settings updated successfully.');
    }, 600);
  }

  resetSettings(): void {
    this.clearMessages();

    const confirmed = window.confirm(
      'Restore notifications, appearance, and session settings to their defaults? This won\'t change your name or email.'
    );

    if (!confirmed) {
      return;
    }

    this.emailNotifications = DEFAULT_PREFERENCES.emailNotifications;
    this.systemNotifications = DEFAULT_PREFERENCES.systemNotifications;
    this.soundNotifications = DEFAULT_PREFERENCES.soundNotifications;
    this.compactMode = DEFAULT_PREFERENCES.compactMode;
    this.sessionTimeout = DEFAULT_PREFERENCES.sessionTimeout;

    this.snapshot = this.captureSnapshot();
    this.showMessage('Settings restored to default.');
  }

  // =====================================================
  // MESSAGE HELPERS
  // =====================================================

  private showMessage(message: string): void {
    this.saveMessage = message;

    if (this.saveMessageTimer) {
      clearTimeout(this.saveMessageTimer);
    }

    this.saveMessageTimer = setTimeout(() => {
      this.saveMessage = '';
    }, 3000);
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.saveMessage = '';

    if (this.saveMessageTimer) {
      clearTimeout(this.saveMessageTimer);
      this.saveMessageTimer = null;
    }
  }
}