import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarNavSection } from '../../models/dashboard.model';
import { AuthService } from '../../../services/auth.service';
import { PermissionsService } from '../../../services/permissions.service';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Topbar],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  private readonly permissionsService = inject(PermissionsService);

  // ===========================================================
  // SIDEBAR COLLAPSE STATE
  // ===========================================================

  /**
   * false = expanded
   * true  = collapsed
   */
  private readonly sidebarStateKey = 'ev-sidebar-collapsed';

  isCollapsed = localStorage.getItem(this.sidebarStateKey) === 'true';

  @Input() showTopbar = true;

  /**
   * Sends the collapse state to the dashboard layout.
   */
  @Output() collapsedChange = new EventEmitter<boolean>();

  /**
   * Toggle sidebar between expanded and collapsed states.
   */
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem(this.sidebarStateKey, String(this.isCollapsed));

    this.collapsedChange.emit(this.isCollapsed);
  }


  // ===========================================================
  // SIDEBAR NAVIGATION
  // ===========================================================

  readonly sections: SidebarNavSection[] = [

    // =========================================================
    // OVERVIEW
    // =========================================================
    {
      title: 'Overview',
      items: [
        {
          label: 'Dashboard',
          icon: 'layout-dashboard',
          route: '/dashboard',
          permissionKey: 'dashboard'
        }
      ]
    },

    // =========================================================
    // MANAGEMENT
    // =========================================================
    {
      title: 'Management',
      items: [
        {
          label: 'EV Users',
          icon: 'users',
          route: '/users',
          permissionKey: 'users'
        },

        {
          label: 'Wallet History',
          icon: 'wallet',
          route: '/wallet-history',
          permissionKey: 'wallet-history'
        },

        {
          label: 'Charge Manager',
          icon: 'user-cog',
          route: '/charge-manager',
          permissionKey: 'charge-manager'
        },

        {
          label: 'Charge Transactions',
          icon: 'receipt',
          route: '/charge-transactions',
          permissionKey: 'charge-transactions'
        },

        {
          label: 'Devices Master',
          icon: 'cpu',
          route: '/devices-master',
          permissionKey: 'devices-master'
        }
      ]
    },

    // =========================================================
    // LOGS
    // =========================================================
    {
      title: 'Logs',
      items: [
        {
          label: 'Device Logs',
          icon: 'logs',
          route: '/device-logs',
          permissionKey: 'device-logs'
        },

        {
          label: 'Server Logs',
          icon: 'logs',
          route: '/server-logs',
          permissionKey: 'server-logs'
        }
      ]
    },

    // =========================================================
    // CONFIGURATION
    // =========================================================
    {
      title: 'Configuration',
      items: [
        {
          label: 'Account Info',
          icon: 'user-circle',
          route: '/account-info',
          permissionKey: 'account-info'
        },

        {
          label: 'App Versions',
          icon: 'smartphone',
          route: '/app-versions',
          permissionKey: 'app-versions'
        },

        {
          label: 'Config Data',
          icon: 'database',
          route: '/config-data',
          permissionKey: 'config-data'
        },

        {
          label: 'Socket Info',
          icon: 'radio',
          route: '/socket-info',
          permissionKey: 'socket-info'
        }
      ]
    },

    // =========================================================
    // ANALYTICS
    // =========================================================
    {
      title: 'Analytics',
      items: [
        {
          label: 'Analytics',
          icon: 'bar-chart',
          route: '/analytics',
          permissionKey: 'analytics'
        }
      ]
    },

    // =========================================================
    // OTHERS
    // =========================================================
    {
      title: 'Others',
      items: [
        {
          label: 'Settings',
          icon: 'settings',
          route: '/settings',
          permissionKey: 'settings'
        },

        {
          label: 'Permissions',
          icon: 'user-cog',
          route: '/permissions',
          permissionKey: 'settings'
        }
      ]
    }
  ];

  get visibleSections(): SidebarNavSection[] {
    return this.sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          const permissionKey = item.permissionKey ?? (item.route.replace('/', '').split('?')[0] || 'dashboard');
          return this.permissionsService.hasAccess(permissionKey, 'view');
        })
      }))
      .filter(section => section.items.length > 0);
  }


  // ===========================================================
  // CURRENT USER
  // ===========================================================

  readonly currentUser = {
    name: 'Ramesh Chippada',
    role: 'Administrator',
    email: 'admin@chargehub.com',
    phone: '+91 98765 43210'
  };


  // ===========================================================
  // PROFILE MODAL
  // ===========================================================

  showProfile = false;

  openProfile(): void {
    this.showProfile = true;
  }

  closeProfile(): void {
    this.showProfile = false;
  }


  // ===========================================================
  // LOGOUT
  // ===========================================================

  logout(): void {
    this.showProfile = false;
    this.authService.logout();
    void this.router.navigateByUrl('/signed-out');
  }

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}
}