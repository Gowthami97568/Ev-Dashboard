import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface TopbarUser {
  name: string;
  role: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {

  @Input() title = 'Dashboard';

  // Kept only for compatibility; it is no longer displayed.
  @Input() selectedDate = '';

  @Input() currentUser: TopbarUser = {
    name: 'Ramesh Chippada',
    role: 'Administrator'
  };
  /** Emits when the person picks "Sign out" — the host app decides what that actually does (clear auth, redirect, etc). */
  @Output() readonly signOutRequested = new EventEmitter<void>();

  // Real unread notification count.
  // 0 = no red notification badge.
  unreadNotificationCount = 0;

  isProfileMenuOpen = false;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  get hasUnreadAlerts(): boolean {
    return this.unreadNotificationCount > 0;
  }

  get notificationLabel(): string {
    return this.unreadNotificationCount > 99
      ? '99+'
      : String(this.unreadNotificationCount);
  }

  get initials(): string {
    const parts = this.currentUser.name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return '?';
    }

    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';

    return (first + last).toUpperCase();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  signOut(): void {
    this.closeProfileMenu();
    this.signOutRequested.emit();
  }

  // Close the menu when clicking anywhere outside the topbar.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isProfileMenuOpen) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.closeProfileMenu();
    }
  }
  // Close the menu on Escape for keyboard users.
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeProfileMenu();
  }
}