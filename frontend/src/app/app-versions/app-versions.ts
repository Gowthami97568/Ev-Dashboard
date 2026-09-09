import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AppVersionService,
  AppVersionRecord,
  AppVersionSummary,
  AppVersionColumnsResponse,
  AppVersionListResponse,
  AppVersionSummaryResponse
} from '../services/app-version.service';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-app-versions',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './app-versions.html',
  styleUrl: './app-versions.css'
})
export class AppVersions implements OnInit {

  records: AppVersionRecord[] = [];

  columns: string[] = [];

  summary: AppVersionSummary = {
    total: 0
  };

  searchTerm = '';
  
  loading = true;

  errorMessage = '';

  page = 1;

  limit = 10;

  total = 0;

  totalPages = 0;

  selectedRecord: AppVersionRecord | null = null;

  showDetails = false;

  constructor(
    private readonly appVersionService:
      AppVersionService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadColumns();
    this.loadAppVersions();
  }

  // ======================================================
  // SUMMARY
  // ======================================================

  loadSummary(): void {

    this.appVersionService
      .getSummary()
      .subscribe({

        next: (
          response: AppVersionSummaryResponse
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
            'App version summary error:',
            error
          );
        }
      });
  }

  // ======================================================
  // COLUMNS
  // ======================================================

  loadColumns(): void {

    this.appVersionService
      .getColumns()
      .subscribe({

        next: (
          response: AppVersionColumnsResponse
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
            'App version columns error:',
            error
          );
        }
      });
  }

  // ======================================================
  // RECORDS
  // ======================================================

  loadAppVersions(): void {

    this.loading = true;

    this.errorMessage = '';

    this.appVersionService
      .getAppVersions(
        this.page,
        this.limit,
        this.searchTerm
      )
      .subscribe({

        next: (
          response: AppVersionListResponse
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
              'Failed to load app versions.';
          }

          this.loading = false;
        },

        error: (error: unknown) => {

          console.error(
            'App Version API Error:',
            error
          );

          this.records = [];

          this.total = 0;

          this.totalPages = 0;

          this.errorMessage =
            'Unable to load app versions from backend.';

          this.loading = false;
        }
      });
  }

  // ======================================================
  // SEARCH
  // ======================================================

  applySearch(): void {

    this.page = 1;

    this.loadAppVersions();
  }

  clearSearch(): void {

    this.searchTerm = '';

    this.page = 1;

    this.loadAppVersions();
  }

  // ======================================================
  // PAGINATION
  // ======================================================

  previousPage(): void {

    if (this.page > 1) {

      this.page--;

      this.loadAppVersions();
    }
  }

  nextPage(): void {

    if (this.page < this.totalPages) {

      this.page++;

      this.loadAppVersions();
    }
  }

  // ======================================================
  // DETAILS
  // ======================================================

  openDetails(
    record: AppVersionRecord
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