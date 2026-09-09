import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AccountInfoService,
  AccountInfoRecord,
  AccountInfoSummary,
  AccountInfoColumnsResponse,
  AccountInfoListResponse,
  AccountInfoSummaryResponse
} from '../services/account-info.service';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-account-info',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './account-info.html',
  styleUrl: './account-info.css'
})
export class AccountInfo implements OnInit {

  records: AccountInfoRecord[] = [];

  columns: string[] = [];

  summary: AccountInfoSummary = {
    total: 0
  };

  searchTerm = '';

  loading = true;

  errorMessage = '';

  page = 1;

  limit = 10;

  total = 0;

  totalPages = 0;

  selectedRecord: AccountInfoRecord | null = null;

  showDetails = false;

  constructor(
    private readonly accountInfoService:
      AccountInfoService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadColumns();
    this.loadAccountInfo();
  }


  // ======================================================
  // SUMMARY
  // ======================================================

  loadSummary(): void {

    this.accountInfoService
      .getSummary()
      .subscribe({
        next: (
          response: AccountInfoSummaryResponse
        ) => {

          if (
            response.success &&
            response.data
          ) {
            this.summary =
              response.data;
          }
        },

        error: (error: unknown) => {

          console.error(
            'Account info summary error:',
            error
          );
        }
      });
  }

  // ======================================================
  // COLUMNS
  // ======================================================

  loadColumns(): void {

    this.accountInfoService
      .getColumns()
      .subscribe({
        next: (
          response: AccountInfoColumnsResponse
        ) => {

          if (
            response.success &&
            response.data
          ) {
            this.columns =
              response.data.columns;
          }
        },

        error: (error: unknown) => {

          console.error(
            'Account info columns error:',
            error
          );
        }
      });
  }

  // ======================================================
  // RECORDS
  // ======================================================

  loadAccountInfo(): void {

    this.loading = true;

    this.errorMessage = '';

    this.accountInfoService
      .getAccountInfo(
        this.page,
        this.limit,
        this.searchTerm
      )
      .subscribe({
        next: (
          response: AccountInfoListResponse
        ) => {

          if (
            response.success &&
            response.data
          ) {

            this.records =
              response.data.items || [];

            this.total =
              response.data.pagination.total;

            this.totalPages =
              response.data.pagination.totalPages;

          } else {

            this.records = [];

            this.total = 0;

            this.totalPages = 0;

            this.errorMessage =
              response.message ||
              'Failed to load account information.';
          }

          this.loading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Account Info API Error:',
            error
          );

          this.records = [];

          this.total = 0;

          this.totalPages = 0;

          this.errorMessage =
            'Unable to load account information from backend.';

          this.loading = false;
        }
      });
  }

  // ======================================================
  // SEARCH
  // ======================================================

  applySearch(): void {
    this.page = 1;
    this.loadAccountInfo();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.loadAccountInfo();
  }

  // ======================================================
  // PAGINATION
  // ======================================================

  previousPage(): void {

    if (this.page > 1) {

      this.page--;

      this.loadAccountInfo();
    }
  }

  nextPage(): void {

    if (this.page < this.totalPages) {

      this.page++;

      this.loadAccountInfo();
    }
  }

  // ======================================================
  // DETAILS
  // ======================================================

  openDetails(
    record: AccountInfoRecord
  ): void {

    this.selectedRecord =
      record;

    this.showDetails = true;
  }

  closeDetails(): void {

    this.selectedRecord =
      null;

    this.showDetails = false;
  }

  // ======================================================
  // DISPLAY HELPERS
  // ======================================================

  formatColumnName(
    column: string
  ): string {

    return column
      .replace(/_/g, ' ')
      .replace(
        /([a-z])([A-Z])/g,
        '$1 $2'
      )
      .replace(
        /\b\w/g,
        char => char.toUpperCase()
      );
  }

  formatValue(
    value: unknown
  ): string {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    return String(value);
  }

  getVisibleColumns(): string[] {
    return this.columns.slice(0, 8);
  }
}
