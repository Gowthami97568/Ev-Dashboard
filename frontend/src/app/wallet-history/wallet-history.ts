import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  WalletHistoryService,
  WalletRecord,
  WalletSummary,
  WalletColumnsResponse,
  WalletListResponse,
  WalletSummaryResponse
} from '../services/wallet-history.service';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-wallet-history',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './wallet-history.html',
  styleUrl: './wallet-history.css'
})
export class WalletHistory implements OnInit {

  // =====================================================
  // DATA
  // =====================================================

  records: WalletRecord[] = [];

  columns: string[] = [];


  // =====================================================
  // SUMMARY
  // =====================================================

  summary: WalletSummary = {
    total: 0
  };


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';

  typeFilter = '';


  // =====================================================
  // STATES
  // =====================================================

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // PAGINATION
  // =====================================================

  page = 1;

  limit = 10;

  total = 0;

  totalPages = 0;


  // =====================================================
  // DETAILS
  // =====================================================

  selectedRecord: WalletRecord | null = null;

  showDetails = false;


  // =====================================================
  // EDIT
  // =====================================================

  showEditModal = false;

  editingRecord: WalletRecord = {} as WalletRecord;


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly walletService: WalletHistoryService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadSummary();

    this.loadColumns();

    this.loadWalletHistory();

  }


  // =====================================================
  // SUMMARY
  // =====================================================

  loadSummary(): void {

    this.walletService
      .getSummary()
      .subscribe({

        next: (
          response: WalletSummaryResponse
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
            'Wallet summary error:',
            error
          );

        }

      });

  }


  // =====================================================
  // COLUMNS
  // =====================================================

  loadColumns(): void {

    this.walletService
      .getColumns()
      .subscribe({

        next: (
          response: WalletColumnsResponse
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
            'Wallet columns error:',
            error
          );

        }

      });

  }


  // =====================================================
  // WALLET HISTORY
  // =====================================================

  loadWalletHistory(): void {

    this.loading = true;

    this.errorMessage = '';

    this.walletService
      .getWalletHistory(
        this.page,
        this.limit,
          this.searchTerm,
          this.typeFilter
      )
      .subscribe({

        next: (
          response: WalletListResponse
        ) => {

          if (
            response.success &&
            response.data
          ) {

            this.records =
              response.data.items || [];

            this.total =
              Number(
                response.data.pagination?.total || 0
              );

            this.totalPages =
              Number(
                response.data.pagination?.totalPages || 0
              );

          } else {

            this.records = [];

            this.total = 0;

            this.totalPages = 0;

            this.errorMessage =
              response.message ||
              'Failed to load wallet history.';

          }

          this.loading = false;

        },

        error: (error: unknown) => {

          console.error(
            'Wallet History API Error:',
            error
          );

          this.records = [];

          this.total = 0;

          this.totalPages = 0;

          this.errorMessage =
            'Unable to load wallet history from backend.';

          this.loading = false;

        }

      });

  }


  // =====================================================
  // SEARCH
  // =====================================================

  applySearch(): void {

    this.page = 1;

    this.loadWalletHistory();

  }


  clearSearch(): void {

    this.searchTerm = '';

    this.typeFilter = '';

    this.page = 1;

    this.loadWalletHistory();

  }


  // =====================================================
  // PAGINATION
  // =====================================================

  previousPage(): void {

    if (
      this.page <= 1 ||
      this.total === 0
    ) {

      return;

    }

    this.page--;

    this.loadWalletHistory();

  }


  nextPage(): void {

    if (
      this.page >= this.totalPages ||
      this.total === 0
    ) {

      return;

    }

    this.page++;

    this.loadWalletHistory();

  }


  // =====================================================
  // DETAILS
  // =====================================================

  openDetails(
    record: WalletRecord
  ): void {

    this.selectedRecord =
      record;

    this.showDetails = true;

  }


  closeDetails(): void {

    this.selectedRecord = null;

    this.showDetails = false;

  }


  // =====================================================
  // FORMAT COLUMN
  // =====================================================

  formatColumnName(
    column: string
  ): string {

    return column

      .replace(
        /_/g,
        ' '
      )

      .replace(
        /([a-z])([A-Z])/g,
        '$1 $2'
      )

      .replace(
        /\b\w/g,
        char =>
          char.toUpperCase()
      );

  }


  // =====================================================
  // FORMAT VALUE
  // =====================================================

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


  // =====================================================
  // VISIBLE COLUMNS
  // =====================================================

  getVisibleColumns(): string[] {

    return this.columns.slice(
      0,
      8
    );

  }


  // =====================================================
  // EDIT RECORD
  // =====================================================

  editRecord(
    record: WalletRecord
  ): void {

    this.editingRecord = {
      ...record
    };

    this.errorMessage = '';

    this.successMessage = '';

    this.showEditModal = true;

  }


  // =====================================================
  // EDITABLE COLUMNS
  // =====================================================

  getEditableColumns(): string[] {

    return this.getVisibleColumns().filter(
      column =>
        !this.isRecordIdColumn(column)
    );

  }


  // =====================================================
  // IDENTIFIER COLUMN
  // =====================================================

  isRecordIdColumn(
    column: string
  ): boolean {

    const normalized =
      String(column)
        .replace(
          /[_\s-]/g,
          ''
        )
        .toLowerCase();


    return (
      normalized === 'id' ||
      normalized === 'walletid' ||
      normalized === 'walletrecordid' ||
      normalized === 'transactionid' ||
      normalized === 'recordid'
    );

  }


  // =====================================================
  // GET RECORD ID
  // =====================================================

  private getRecordId(
    record: WalletRecord
  ): string {

    const possibleKeys = [

      'id',

      'ID',

      'walletid',

      'walletId',

      'WALLETID',

      'walletrecordid',

      'walletRecordId',

      'transactionid',

      'transactionId',

      'recordid',

      'recordId'

    ];


    for (
      const key of possibleKeys
    ) {

      const value =
        (record as any)[key];


      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {

        return String(
          value
        ).trim();

      }

    }


    return '';

  }


  // =====================================================
  // CLOSE EDIT MODAL
  // =====================================================

  closeEditModal(): void {

    if (this.saving) {

      return;

    }


    this.showEditModal = false;

    this.editingRecord =
      {} as WalletRecord;

  }


  // =====================================================
  // SAVE RECORD
  // =====================================================

  saveRecord(): void {

    const recordId =
      this.getRecordId(
        this.editingRecord
      );


    if (!recordId) {

      this.errorMessage =
        'Wallet record ID is required.';

      return;

    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    const payload:
      Partial<WalletRecord> = {

      ...this.editingRecord

    };


    this.walletService
      .updateRecord(
        recordId,
        payload
      )
      .subscribe({

        next: (
          response: any
        ) => {

          if (
            !response ||
            response.success !== true
          ) {

            this.errorMessage =
              response?.message ||
              'Failed to update wallet record.';

            this.saving = false;

            return;

          }


          this.saving = false;

          this.showEditModal = false;

          this.editingRecord =
            {} as WalletRecord;


          this.successMessage =
            response.message ||
            'Wallet record updated successfully.';


          // Reload actual database data.

          this.loadWalletHistory();

          this.loadSummary();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Update wallet record error:',
            error
          );


          const backendError =
            error as {
              error?: {
                message?: string;
              };
            };


          this.errorMessage =
            backendError?.error?.message ||
            'Unable to update wallet record.';

          this.saving = false;

        }

      });

  }

}