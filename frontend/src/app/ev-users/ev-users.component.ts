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
  HttpClient,
  HttpClientModule
} from '@angular/common/http';

import {
  Sidebar
} from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-ev-users',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    Sidebar
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

  pageSize = 10;


  // =====================================================
  // EDIT MODAL STATE
  // =====================================================

  isEditModalOpen = false;

  editingUser: any = null;

  savingEdit = false;

  editErrorMessage = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly http: HttpClient
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadUsers();

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
        'http://localhost:5000/api/users'
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

    if (!this.editingUser) {

      return [];

    }


    return Object.keys(
      this.editingUser
    );

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
      `http://localhost:5000/api/users/${userId}`;


    console.log(
      'PUT URL:',
      url
    );


    console.log(
      'PUT Request Body:',
      this.editingUser
    );


    // ---------------------------------------------
    // SEND UPDATE REQUEST
    // ---------------------------------------------

    this.http
      .put<any>(
        url,
        this.editingUser
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
              ...this.editingUser
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

    if (
      this.filteredUsers.length === 0
    ) {

      return [];

    }


    return Object.keys(
      this.filteredUsers[0]
    );

  }

}