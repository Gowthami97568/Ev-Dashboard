import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ChargeTransactionService,
  ChargeTransaction,
  TransactionSummary,
  TransactionFilters,
  TransactionListResponse,
  TransactionSummaryResponse,
  TransactionFiltersResponse
} from '../services/charge-transaction.service';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-charge-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],
  templateUrl: './charge-transactions.html',
  styleUrl: './charge-transactions.css'
})
export class ChargeTransactions implements OnInit {

  transactions: ChargeTransaction[] = [];

  summary: TransactionSummary = {
    total: 0,
    charging: 0,
    accepted: 0,
    stopped: 0,
    requested: 0,
    totalKwh: 0,
    totalChargeValue: 0
  };

  filters: TransactionFilters = {
    createdBy: [],
    reasons: [],
    statuses: [],
    chargeStatuses: []
  };

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  searchTerm = '';

  chargeStatusFilter = '';

  statusFilter = '';

  reasonFilter = '';

  createdByFilter = '';

  dateFrom = '';

  dateTo = '';

  page = 1;

  limit = 500;

  total = 0;

  totalPages = 0;

  selectedTransaction: ChargeTransaction | null = null;

  showDetails = false;


  // ======================================================
  // EDIT
  // ======================================================

  showEditModal = false;

  editingTransaction: Partial<ChargeTransaction> = {};


  constructor(
    private readonly transactionService: ChargeTransactionService
  ) {}


  ngOnInit(): void {

    this.loadSummary();

    this.loadFilters();

    this.loadTransactions();

  }


  // ======================================================
  // SUMMARY
  // ======================================================

  loadSummary(): void {

    this.transactionService.getSummary().subscribe({

      next: (response: TransactionSummaryResponse) => {

        if (
          response.success &&
          response.data
        ) {

          this.summary = response.data;

        }

      },

      error: (error: unknown) => {

        console.error(
          'Transaction summary error:',
          error
        );

      }

    });

  }


  // ======================================================
  // FILTER OPTIONS
  // ======================================================

  loadFilters(): void {

    this.transactionService.getFilters().subscribe({

      next: (response: TransactionFiltersResponse) => {

        if (
          response.success &&
          response.data
        ) {

          this.filters = response.data;

        }

      },

      error: (error: unknown) => {

        console.error(
          'Transaction filters error:',
          error
        );

      }

    });

  }


  // ======================================================
  // TRANSACTIONS
  // ======================================================

  loadTransactions(): void {

    this.loading = true;

    this.errorMessage = '';

    this.transactionService
      .getTransactions(
        this.page,
        this.limit,
        this.searchTerm,
        this.chargeStatusFilter,
        this.statusFilter,
        this.reasonFilter,
        this.createdByFilter,
        this.dateFrom,
        this.dateTo
      )
      .subscribe({

        next: (response: TransactionListResponse) => {

          if (
            response.success &&
            response.data
          ) {

            this.transactions =
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

            this.transactions = [];

            this.total = 0;

            this.totalPages = 0;

            this.errorMessage =
              response.message ||
              'Failed to load transactions.';

          }

          this.loading = false;

        },

        error: (error: unknown) => {

          console.error(
            'Charge Transactions API Error:',
            error
          );

          this.transactions = [];

          this.total = 0;

          this.totalPages = 0;

          this.errorMessage =
            'Unable to load transaction data from backend.';

          this.loading = false;

        }

      });

  }


  // ======================================================
  // FILTERS
  // ======================================================

  applyFilters(): void {

    this.page = 1;

    this.loadTransactions();

  }


  onFilterChange(): void {

    this.page = 1;

    this.loadTransactions();

  }


  clearFilters(): void {

    this.searchTerm = '';

    this.chargeStatusFilter = '';

    this.statusFilter = '';

    this.reasonFilter = '';

    this.createdByFilter = '';

    this.dateFrom = '';

    this.dateTo = '';

    this.page = 1;

    this.loadTransactions();

  }


  // ======================================================
  // PAGINATION
  // ======================================================

  previousPage(): void {

    if (
      this.page <= 1 ||
      this.total === 0
    ) {

      return;

    }

    this.page--;

    this.loadTransactions();

  }


  nextPage(): void {

    if (
      this.page >= this.totalPages ||
      this.total === 0
    ) {

      return;

    }

    this.page++;

    this.loadTransactions();

  }


  // ======================================================
  // CHARGE STATUS
  // ======================================================

  getChargeStatusLabel(
    value: unknown
  ): string {

    const numericValue =
      Number(value);

    if (numericValue === 1) {
      return '1';
    }

    if (numericValue === 2) {
      return '2';
    }

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '—';
    }

    return String(value);

  }


  getChargeStatusClass(
    value: unknown
  ): string {

    const numericValue =
      Number(value);

    if (numericValue === 1) {
      return 'charging';
    }

    if (numericValue === 2) {
      return 'stopped';
    }

    return 'unknown';

  }


  // ======================================================
  // STATUS
  // ======================================================

  getStatusClass(
    value: string | null | undefined
  ): string {

    const status =
      String(
        value || ''
      ).toLowerCase();

    if (status === 'accepted') {
      return 'accepted';
    }

    if (status === 'stopped') {
      return 'stopped';
    }

    if (status === 'requested') {
      return 'requested';
    }

    return 'unknown';

  }


  // ======================================================
  // DETAILS
  // ======================================================

  openDetails(
    transaction: ChargeTransaction
  ): void {

    this.selectedTransaction =
      transaction;

    this.showDetails = true;

  }


  closeDetails(): void {

    this.showDetails = false;

    this.selectedTransaction =
      null;

  }


  // ======================================================
  // EDIT
  // ======================================================

  editTransaction(
    transaction: ChargeTransaction
  ): void {

    this.editingTransaction = {
      ...transaction
    };

    this.errorMessage = '';

    this.successMessage = '';

    this.showEditModal = true;

  }


  // ======================================================
  // CLOSE EDIT
  // ======================================================

  closeEditModal(): void {

    if (this.saving) {
      return;
    }

    this.showEditModal = false;

    this.editingTransaction = {};

  }


  // ======================================================
  // SAVE EDIT
  // ======================================================

  saveTransaction(): void {

    const transactionId =
      String(
        this.editingTransaction.transactionid ?? ''
      ).trim();


    if (!transactionId) {

      this.errorMessage =
        'Transaction ID is missing.';

      return;

    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    const payload:
      Partial<ChargeTransaction> = {
      ...this.editingTransaction
    };


    this.transactionService
      .updateTransaction(
        transactionId,
        payload
      )
      .subscribe({

        next: (response: any) => {

          if (!response?.success) {

            this.errorMessage =
              response?.message ||
              'Failed to update transaction.';

            this.saving = false;

            return;

          }


          this.saving = false;

          this.showEditModal = false;

          this.editingTransaction = {};


          this.successMessage =
            response.message ||
            'Transaction updated successfully.';


          // Refresh actual database data.

          this.loadTransactions();

          this.loadSummary();

        },

        error: (error: unknown) => {

          console.error(
            'Update transaction error:',
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
            'Unable to update transaction.';

          this.saving = false;

        }

      });

  }

}