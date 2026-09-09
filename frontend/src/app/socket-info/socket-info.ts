import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  SocketInfoService,
  SocketInfoRecord,
  SocketInfoSummary,
  SocketInfoColumnsResponse,
  SocketInfoListResponse,
  SocketInfoSummaryResponse
} from '../services/socket-info.service';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-socket-info',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './socket-info.html',
  styleUrl: './socket-info.css'
})
export class SocketInfo implements OnInit {

  records: SocketInfoRecord[] = [];

  columns: string[] = [];

  summary: SocketInfoSummary = {
    total: 0
  };

  searchTerm = '';

  loading = true;

  errorMessage = '';

  page = 1;

  limit = 10;

  total = 0;

  totalPages = 0;

  selectedRecord: SocketInfoRecord | null = null;

  showDetails = false;

  constructor(
    private readonly socketInfoService:
      SocketInfoService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
    this.loadColumns();
    this.loadSocketInfo();
  }

  // ======================================================
  // SUMMARY
  // ======================================================

  loadSummary(): void {

    this.socketInfoService
      .getSummary()
      .subscribe({

        next: (
          response: SocketInfoSummaryResponse
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
            'Socket info summary error:',
            error
          );
        }
      });
  }

  // ======================================================
  // COLUMNS
  // ======================================================

  loadColumns(): void {

    this.socketInfoService
      .getColumns()
      .subscribe({

        next: (
          response: SocketInfoColumnsResponse
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
            'Socket info columns error:',
            error
          );
        }
      });
  }

  // ======================================================
  // RECORDS
  // ======================================================

  loadSocketInfo(): void {

    this.loading = true;

    this.errorMessage = '';

    this.socketInfoService
      .getSocketInfo(
        this.page,
        this.limit,
        this.searchTerm
      )
      .subscribe({

        next: (
          response: SocketInfoListResponse
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
              'Failed to load socket information.';
          }

          this.loading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Socket Info API Error:',
            error
          );

          this.records = [];

          this.total = 0;

          this.totalPages = 0;

          this.errorMessage =
            'Unable to load socket information from backend.';

          this.loading = false;
        }
      });
  }

  // ======================================================
  // SEARCH
  // ======================================================

  applySearch(): void {
    this.page = 1;
    this.loadSocketInfo();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.page = 1;
    this.loadSocketInfo();
  }

  // ======================================================
  // PAGINATION
  // ======================================================

  previousPage(): void {

    if (this.page > 1) {
      this.page--;
      this.loadSocketInfo();
    }
  }

  nextPage(): void {

    if (this.page < this.totalPages) {
      this.page++;
      this.loadSocketInfo();
    }
  }

  // ======================================================
  // DETAILS
  // ======================================================

  openDetails(
    record: SocketInfoRecord
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