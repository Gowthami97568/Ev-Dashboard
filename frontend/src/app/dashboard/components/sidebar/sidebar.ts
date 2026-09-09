import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarNavSection } from '../../models/dashboard.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

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
          route: '/dashboard'
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
          route: '/users'
        },

        {
          label: 'Wallet History',
          icon: 'wallet',
          route: '/wallet-history'
        },

        {
          label: 'Charge Manager',
          icon: 'user-cog',
          route: '/charge-manager'
        },

        {
          label: 'Charge Transactions',
          icon: 'receipt',
          route: '/charge-transactions'
        },

        {
          label: 'Devices Master',
          icon: 'cpu',
          route: '/devices-master'
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
          route: '/device-logs'
        },

        {
          label: 'Server Logs',
          icon: 'logs',
          route: '/server-logs'
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
          route: '/account-info'
        },

        {
          label: 'App Versions',
          icon: 'smartphone',
          route: '/app-versions'
        },

        {
          label: 'Config Data',
          icon: 'database',
          route: '/config-data'
        },

        {
          label: 'Socket Info',
          icon: 'radio',
          route: '/socket-info'
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
          route: '/analytics'
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
          route: '/settings'
        }
      ]
    }
  ];


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
    console.log('Logout clicked');
  }
}