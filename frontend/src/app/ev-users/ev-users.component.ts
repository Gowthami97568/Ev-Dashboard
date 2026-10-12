import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import {
  Sidebar
} from '../dashboard/components/sidebar/sidebar';
import { Topbar } from '../dashboard/components/topbar/topbar';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { PermissionsService } from '../services/permissions.service';
import { isHiddenDashboardColumn } from '../services/dashboard-column-visibility';

@Component({
  selector: 'app-ev-users',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar,
    Topbar
  ],

  templateUrl: './ev-users.component.html',

  styleUrl: './ev-users.component.css'
})
export class EvUsersComponent implements OnInit {


  // =====================================================
  // DATA
  // =====================================================

  users: any[] = [];

  filteredUsers: any[] = [];


  // =====================================================
  // SEARCH
  // =====================================================

  searchText = '';


  // =====================================================
  // STATES
  // =====================================================

  loading = false;

  errorMessage = '';


  // =====================================================
  // SUMMARY
  // =====================================================

  totalUsers = 0;


  // =====================================================
  // PAGINATION
  // =====================================================

  currentPage = 1;

  pageSize = 50;


  // =====================================================
  // EDIT MODAL STATE
  // =====================================================

  isEditModalOpen = false;

  editingUser: any = null;

  savingEdit = false;

  editErrorMessage = '';

  isViewModalOpen = false;

  viewingUser: Record<string, unknown> | null = null;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly permissionsService: PermissionsService
  ) {}

  get canEditUsers(): boolean {
    return this.permissionsService.hasAccess('users', 'allow');
  }


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadUsers();

  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }


  // =====================================================
  // TOTAL PAGES
  // =====================================================

  get totalPages(): number {

    if (this.filteredUsers.length === 0) {

      return 0;

    }

    return Math.ceil(
      this.filteredUsers.length / this.pageSize
    );

  }


  // =====================================================
  // PAGINATED USERS
  // =====================================================

  get paginatedUsers(): any[] {

    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;

    const endIndex =
      startIndex +
      this.pageSize;

    return this.filteredUsers.slice(
      startIndex,
      endIndex
    );

  }


  // =====================================================
  // VISIBLE PAGE NUMBERS
  // =====================================================

  get visiblePages(): number[] {

    const total =
      this.totalPages;

    const current =
      this.currentPage;


    // ---------------------------------------------
    // No pages
    // ---------------------------------------------

    if (total === 0) {

      return [];
    }


    // ---------------------------------------------
    // Five or fewer pages
    // ---------------------------------------------

    if (total <= 5) {

      return Array.from(
        { length: total },
        (_, index) => index + 1
      );

    }


    // ---------------------------------------------
    // Beginning pages
    //
    // Example:
    // 1 2 3 4 5 ... 24
    // ---------------------------------------------

    if (current <= 3) {

      return [
        1,
        2,
        3,
        4,
        5,
        -1,
        total
      ];

    }


    // ---------------------------------------------
    // Ending pages
    //
    // Example:
    // 1 ... 20 21 22 23 24
    // ---------------------------------------------

    if (current >= total - 2) {

      return [
        1,
        -1,
        total - 4,
        total - 3,
        total - 2,
        total - 1,
        total
      ];

    }


    // ---------------------------------------------
    // Middle pages
    //
    // Example:
    // 1 ... 8 9 10 11 12 ... 24
    // ---------------------------------------------

    return [
      1,
      -1,
      current - 2,
      current - 1,
      current,
      current + 1,
      current + 2,
      -1,
      total
    ];

  }


  // =====================================================
  // LOAD USERS
  // =====================================================

  loadUsers(): void {

    this.loading = true;

    this.errorMessage = '';


    this.http
      .get<any>(
        `${environment.apiUrl}/api/users`
      )
      .subscribe({

        next: (response) => {

          console.log(
            'EV Users API Response:',
            response
          );


          // ---------------------------------------------
          // HANDLE DIFFERENT API RESPONSE FORMATS
          // ---------------------------------------------

          if (Array.isArray(response)) {

            this.users = response;

          }

          else if (
            response &&
            Array.isArray(response.data)
          ) {

            this.users = response.data;

          }

          else if (
            response &&
            Array.isArray(response.users)
          ) {

            this.users = response.users;

          }

          else {

            this.users = [];

          }


          // ---------------------------------------------
          // UPDATE TABLE
          // ---------------------------------------------

          this.filteredUsers = [
            ...this.users
          ];


          this.totalUsers =
            this.users.length;


          // ---------------------------------------------
          // RESET PAGINATION
          // ---------------------------------------------

          this.currentPage = 1;


          console.log(
            'Loaded EV Users:',
            this.users
          );


          // ---------------------------------------------
          // SHOW ID KEYS FOR DEBUGGING
          // ---------------------------------------------

          if (this.users.length > 0) {

            console.log(
              'First user object:',
              this.users[0]
            );

            console.log(
              'First user keys:',
              Object.keys(this.users[0])
            );

          }


          this.loading = false;

        },


        error: (error: unknown) => {

          console.error(
            'EV Users API Error:',
            error
          );


          this.errorMessage =
            'Unable to load EV Users. Please check the backend.';


          this.loading = false;

        }

      });

  }


  // =====================================================
  // SEARCH USERS
  // =====================================================

  searchUsers(): void {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    // ---------------------------------------------
    // RESET TO FIRST PAGE
    // ---------------------------------------------

    this.currentPage = 1;


    // ---------------------------------------------
    // NO SEARCH
    // ---------------------------------------------

    if (!search) {

      this.filteredUsers = [
        ...this.users
      ];

      return;

    }


    // ---------------------------------------------
    // FILTER USERS
    // ---------------------------------------------

    this.filteredUsers =
      this.users.filter(
        (user) =>
          Object.values(user)
            .join(' ')
            .toLowerCase()
            .includes(search)
      );

  }


  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  clearSearch(): void {

    this.searchText = '';


    this.filteredUsers = [
      ...this.users
    ];


    // ---------------------------------------------
    // RESET PAGE
    // ---------------------------------------------

    this.currentPage = 1;

  }


  // =====================================================
  // REFRESH
  // =====================================================

  refreshUsers(): void {

    this.loadUsers();

  }


  // =====================================================
  // GO TO PAGE
  // =====================================================

  goToPage(page: number): void {

    // ---------------------------------------------
    // Ignore ellipsis
    // ---------------------------------------------

    if (page === -1) {

      return;

    }


    // ---------------------------------------------
    // Validate page
    // ---------------------------------------------

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;

    }


    this.currentPage = page;

  }


  // =====================================================
  // PREVIOUS PAGE
  // =====================================================

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }


  // =====================================================
  // NEXT PAGE
  // =====================================================

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }


  // =====================================================
  // FIND USER ID
  // =====================================================

  private getUserId(user: any): any {

    if (!user) {

      return null;

    }


    // ---------------------------------------------
    // COMMON ID FIELD NAMES
    // ---------------------------------------------

    const possibleIdKeys = [

      'id',

      '_id',

      'userId',

      'user_id',

      'userid',

      'userID',

      'ID',

      'UserId',

      'USER_ID',

      'uuid',

      'userUuid',

      'user_uuid'

    ];


    // ---------------------------------------------
    // CHECK COMMON ID FIELDS
    // ---------------------------------------------

    for (
      const key of possibleIdKeys
    ) {

      if (
        user[key] !== undefined &&
        user[key] !== null &&
        user[key] !== ''
      ) {

        console.log(
          `User ID found using field "${key}":`,
          user[key]
        );

        return user[key];

      }

    }


    // ---------------------------------------------
    // CASE-INSENSITIVE ID SEARCH
    // ---------------------------------------------

    const keys =
      Object.keys(user);


    const matchingKey =
      keys.find(
        (key) =>
          key.toLowerCase() === 'id' ||
          key.toLowerCase() === 'user_id' ||
          key.toLowerCase() === 'userid' ||
          key.toLowerCase() === 'useruuid'
      );


    if (matchingKey) {

      const value =
        user[matchingKey];


      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {

        console.log(
          `User ID found using dynamic field "${matchingKey}":`,
          value
        );

        return value;

      }

    }


    // ---------------------------------------------
    // LAST RESORT:
    // FIND ANY FIELD CONTAINING "ID"
    // ---------------------------------------------

    const idKey =
      keys.find(
        (key) =>
          key.toLowerCase().includes('id')
      );


    if (idKey) {

      const value =
        user[idKey];


      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {

        console.log(
          `User ID found using fallback field "${idKey}":`,
          value
        );

        return value;

      }

    }


    // ---------------------------------------------
    // ID NOT FOUND
    // ---------------------------------------------

    console.error(
      'Could not find ID in user object:',
      user
    );


    return null;

  }


  // =====================================================
  // EDIT USER — OPEN MODAL
  // =====================================================

  editUser(user: any): void {

    console.log(
      'Editing user:',
      user
    );


    // ---------------------------------------------
    // CHECK ID BEFORE OPENING EDIT
    // ---------------------------------------------

    const userId =
      this.getUserId(user);


    console.log(
      'User ID:',
      userId
    );


    // ---------------------------------------------
    // CLONE USER
    // ---------------------------------------------

    this.editingUser = {
      ...user
    };


    this.editErrorMessage = '';

    this.isEditModalOpen = true;

  }

  viewUser(user: Record<string, unknown>): void {
    this.viewingUser = { ...user };
    this.isViewModalOpen = true;
  }

  closeViewModal(): void {
    this.isViewModalOpen = false;
    this.viewingUser = null;
  }

  getViewableKeys(): string[] {
    return this.viewingUser ? Object.keys(this.viewingUser) : [];
  }

  formatRecordValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }


  // =====================================================
  // EDIT USER — CLOSE MODAL
  // =====================================================

  closeEditModal(): void {

    this.isEditModalOpen = false;

    this.editingUser = null;

    this.editErrorMessage = '';

  }


  // =====================================================
  // EDIT USER — FIELD KEYS
  // =====================================================

  getEditableKeys(): string[] {
    return this.editingUser
      ? this.getUserColumns().filter(key => !this.isUserKeyColumn(key))
      : [];
  }

  isUserKeyColumn(key: string): boolean {
    const normalized = key.replace(/[_\s-]/g, '').toLowerCase();
    return normalized === 'id' || normalized.endsWith('id') || normalized.endsWith('uuid');

  }


  // =====================================================
  // EDIT USER — SAVE
  // =====================================================

  saveEditedUser(): void {

    // ---------------------------------------------
    // CHECK EDITING USER
    // ---------------------------------------------

    if (!this.editingUser) {

      console.error(
        'No user selected for editing.'
      );

      return;

    }


    // ---------------------------------------------
    // FIND USER ID
    // ---------------------------------------------

    const userId =
      this.getUserId(
        this.editingUser
      );


    console.log(
      'Saving user:',
      this.editingUser
    );


    console.log(
      'Detected User ID:',
      userId
    );


    // ---------------------------------------------
    // STOP IF ID IS NOT FOUND
    // ---------------------------------------------

    if (
      userId === undefined ||
      userId === null ||
      userId === ''
    ) {

      this.editErrorMessage =
        'Could not determine this user ID. Please check the browser console to see the actual ID field returned by the API.';


      console.error(
        'USER ID NOT FOUND.'
      );


      console.error(
        'Available fields:',
        Object.keys(
          this.editingUser
        )
      );


      console.error(
        'User object:',
        this.editingUser
      );


      return;

    }


    // ---------------------------------------------
    // START SAVING
    // ---------------------------------------------

    this.savingEdit = true;

    this.editErrorMessage = '';


    // ---------------------------------------------
    // API URL
    // ---------------------------------------------

    const url =
      `${environment.apiUrl}/api/users/${userId}`;

    const updatePayload = Object.fromEntries(
      this.getEditableKeys().map(key => [key, this.editingUser[key]])
    );


    console.log(
      'PUT URL:',
      url
    );


    console.log(
      'PUT Request Body:',
      updatePayload
    );


    // ---------------------------------------------
    // SEND UPDATE REQUEST
    // ---------------------------------------------

    this.http
      .put<any>(
        url,
        updatePayload
      )
      .subscribe({

        // ==========================================
        // SUCCESS
        // ==========================================

        next: (response) => {

          console.log(
            'EV User Update Response:',
            response
          );


          // -----------------------------------------
          // FIND USER IN LOCAL ARRAY
          // -----------------------------------------

          const index =
            this.users.findIndex(
              (user) => {

                const existingUserId =
                  this.getUserId(user);


                return String(
                  existingUserId
                ) === String(
                  userId
                );

              }
            );


          console.log(
            'Updated user index:',
            index
          );


          // -----------------------------------------
          // UPDATE LOCAL USER
          // -----------------------------------------

          if (index !== -1) {

            this.users[index] = {
              ...this.users[index],
              ...updatePayload
            };

          }


          // -----------------------------------------
          // UPDATE FILTERED USERS
          // -----------------------------------------

          this.filteredUsers =
            [...this.users];


          // -----------------------------------------
          // UPDATE TOTAL
          // -----------------------------------------

          this.totalUsers =
            this.users.length;


          // -----------------------------------------
          // STOP SAVING
          // -----------------------------------------

          this.savingEdit = false;


          // -----------------------------------------
          // CLOSE MODAL
          // -----------------------------------------

          this.closeEditModal();


          // -----------------------------------------
          // LOAD AGAIN FROM DATABASE
          // -----------------------------------------

          this.loadUsers();

        },


        // ==========================================
        // ERROR
        // ==========================================

        error: (error: any) => {

          console.error(
            'EV User Update Error:',
            error
          );


          console.error(
            'HTTP Status:',
            error?.status
          );


          console.error(
            'Backend Error:',
            error?.error
          );


          this.editErrorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Failed to update user. Please check the backend API.';


          this.savingEdit = false;

        }

      });

  }


  // =====================================================
  // GET COLUMNS
  // =====================================================

  getUserColumns(): string[] {
    if (this.filteredUsers.length === 0) {
      return [];
    }

    const columns = Object.keys(this.filteredUsers[0]);
    const preferredColumns = [
      'consumerid',
      'mobile',
      'fname',
      'lname',
      'city',
      'state',
      'vehicle_type',
      'active'
    ];
    const visibleColumns = preferredColumns
      .map(preferred => columns.find(column => column.toLowerCase() === preferred))
      .filter(
        (column): column is string =>
          column !== undefined && !isHiddenDashboardColumn(column)
      );

    return visibleColumns.length > 0
      ? visibleColumns
      : columns
        .filter(column => column !== '__v' && !isHiddenDashboardColumn(column))
        .slice(0, 8);
  }

  getUserColumnLabel(column: string): string {
    const labels: Record<string, string> = {
      consumerid: 'Consumer ID',
      country_code: 'Country Code',
      fname: 'First Name',
      lname: 'Last Name',
      vehicle_type: 'Vehicle Type',
      vehicle_brand: 'Vehicle Brand',
      vehicle_model: 'Vehicle Model',
      lastlogin: 'Last Login',
      usertype: 'User Type',
      rfid: 'RFID',
      aadhaar: 'Aadhaar',
      pancard: 'PAN Card'
    };
    const normalized = column.toLowerCase();

    return labels[normalized] ?? column
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

}