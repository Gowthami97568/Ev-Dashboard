import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ConfigDataService,
  ConfigDataRecord,
  ConfigDataSummary,
  ConfigDataColumnsResponse,
  ConfigDataListResponse,
  ConfigDataSummaryResponse,
  ConfigDataUpdateResponse
} from '../dashboard/services/config-data.service';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-config-data',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './config-data.html',
  styleUrl: './config-data.css'
})
export class ConfigData implements OnInit {

  // ======================================================
  // DATA
  // ======================================================

  records: ConfigDataRecord[] = [];

  columns: string[] = [];


  // ======================================================
  // SUMMARY
  // ======================================================

  summary: ConfigDataSummary = {
    total: 0
  };


  // ======================================================
  // SEARCH
  // ======================================================

  searchTerm = '';


  // ======================================================
  // STATE
  // ======================================================

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // ======================================================
  // PAGINATION
  // ======================================================

  page = 1;

  limit = 10;

  total = 0;

  totalPages = 0;


  // ======================================================
  // DETAILS
  // ======================================================

  selectedRecord: ConfigDataRecord | null = null;

  showDetails = false;


  // ======================================================
  // EDIT
  // ======================================================

  showEditModal = false;

  editingRecord: ConfigDataRecord = {};


  // ======================================================
  // ORIGINAL RECORD IDENTIFIER
  // ======================================================

  originalSerialNumber = '';


  // ======================================================
  // CONSTRUCTOR
  // ======================================================

  constructor(
    private readonly configDataService: ConfigDataService
  ) {}


  // ======================================================
  // INIT
  // ======================================================

  ngOnInit(): void {

    this.loadSummary();

    this.loadColumns();

    this.loadConfigData();

  }


  // ======================================================
  // SUMMARY
  // ======================================================

  loadSummary(): void {

    this.configDataService
      .getSummary()
      .subscribe({

        next: (
          response: ConfigDataSummaryResponse
        ) => {

          if (
            response.success &&
            response.data
          ) {

            this.summary = response.data;

          }

        },

        error: (error: unknown) => {

          console.error(
            'Config summary error:',
            error
          );

        }

      });

  }


  // ======================================================
  // COLUMNS
  // ======================================================

  loadColumns(): void {

    this.configDataService
      .getColumns()
      .subscribe({

        next: (
          response: ConfigDataColumnsResponse
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
            'Config columns error:',
            error
          );

        }

      });

  }


  // ======================================================
  // LOAD CONFIG DATA
  // ======================================================

  loadConfigData(): void {

    this.loading = true;

    this.errorMessage = '';


    this.configDataService
      .getConfigData(
        this.page,
        this.limit,
        this.searchTerm
      )
      .subscribe({

        next: (
          response: ConfigDataListResponse
        ) => {

          console.log(
            'CONFIG DATA RESPONSE:',
            response
          );


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
              'Failed to load configuration data.';

          }


          this.loading = false;

        },

        error: (error: unknown) => {

          console.error(
            'Config Data API Error:',
            error
          );


          this.records = [];

          this.total = 0;

          this.totalPages = 0;

          this.errorMessage =
            'Unable to load configuration data.';

          this.loading = false;

        }

      });

  }


  // ======================================================
  // SEARCH
  // ======================================================

  applySearch(): void {

    this.page = 1;

    this.loadConfigData();

  }


  // ======================================================
  // CLEAR SEARCH
  // ======================================================

  clearSearch(): void {

    this.searchTerm = '';

    this.page = 1;

    this.loadConfigData();

  }


  // ======================================================
  // PREVIOUS PAGE
  // ======================================================

  previousPage(): void {

    if (
      this.page <= 1 ||
      this.total === 0
    ) {

      return;

    }


    this.page--;

    this.loadConfigData();

  }


  // ======================================================
  // NEXT PAGE
  // ======================================================

  nextPage(): void {

    if (
      this.page >= this.totalPages ||
      this.total === 0
    ) {

      return;

    }


    this.page++;

    this.loadConfigData();

  }


  // ======================================================
  // VIEW
  // ======================================================

  openDetails(
    record: ConfigDataRecord
  ): void {

    this.selectedRecord = {
      ...record
    };

    this.showDetails = true;

  }


  // ======================================================
  // CLOSE VIEW
  // ======================================================

  closeDetails(): void {

    this.selectedRecord = null;

    this.showDetails = false;

  }


  // ======================================================
  // FORMAT COLUMN
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


  // ======================================================
  // FORMAT VALUE
  // ======================================================

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


  // ======================================================
  // VISIBLE COLUMNS
  // ======================================================

  getVisibleColumns(): string[] {

    return this.columns.slice(0, 8);

  }


  // ======================================================
  // EDIT
  // ======================================================

  editRecord(
    record: ConfigDataRecord
  ): void {

    console.log(
      'EDIT RECORD:',
      record
    );


    // -----------------------------------------------
    // Copy record
    // -----------------------------------------------

    this.editingRecord = {
      ...record
    };


    // -----------------------------------------------
    // Get original serial number
    // -----------------------------------------------

    this.originalSerialNumber =
      String(
        record['chargeBoxSerialNumber'] ?? ''
      ).trim();


    console.log(
      'ORIGINAL SERIAL NUMBER:',
      this.originalSerialNumber
    );


    // -----------------------------------------------
    // Check identifier
    // -----------------------------------------------

    if (
      !this.originalSerialNumber
    ) {

      console.error(
        '❌ chargeBoxSerialNumber is missing',
        record
      );

      this.errorMessage =
        'Charge Box Serial Number is missing from this record.';

      return;

    }


    this.errorMessage = '';

    this.successMessage = '';

    this.showEditModal = true;

  }


  // ======================================================
  // IDENTIFIER COLUMN
  // ======================================================

  isRecordIdColumn(
    column: string
  ): boolean {

    return (
      column === 'chargeBoxSerialNumber'
    );

  }


  // ======================================================
  // EDITABLE COLUMNS
  // ======================================================

  getEditableColumns(): string[] {

    return this.getVisibleColumns()
      .filter(
        column =>
          !this.isRecordIdColumn(column)
      );

  }


  // ======================================================
  // CLOSE EDIT
  // ======================================================

  closeEditModal(): void {

    if (this.saving) {

      return;

    }


    this.showEditModal = false;

    this.editingRecord = {};

    this.originalSerialNumber = '';

  }


  // ======================================================
  // SAVE
  // ======================================================

  saveRecord(): void {

    console.log(
      '================================'
    );

    console.log(
      'SAVE BUTTON CLICKED'
    );

    console.log(
      'Original Serial:',
      this.originalSerialNumber
    );

    console.log(
      'Editing Record:',
      this.editingRecord
    );


    // ==================================================
    // CHECK SERIAL NUMBER
    // ==================================================

    if (
      !this.originalSerialNumber
    ) {

      this.errorMessage =
        'Charge Box Serial Number is missing.';

      console.error(
        '❌ Cannot save: serial number missing'
      );

      return;

    }


    // ==================================================
    // START SAVING
    // ==================================================

    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    // ==================================================
    // CREATE PAYLOAD
    // ==================================================

    const payload: ConfigDataRecord = {
      ...this.editingRecord
    };


    console.log(
      'PUT PAYLOAD:',
      payload
    );


    console.log(
      'PUT URL:',
      `${environment.apiUrl}/api/config-data/${this.originalSerialNumber}`
    );


    // ==================================================
    // SEND UPDATE
    // ==================================================

    this.configDataService
      .updateRecord(
        this.originalSerialNumber,
        payload
      )
      .subscribe({

        next: (
          response: ConfigDataUpdateResponse
        ) => {

          console.log(
            'UPDATE RESPONSE:',
            response
          );


          // --------------------------------------------
          // FAILED
          // --------------------------------------------

          if (
            !response ||
            response.success !== true
          ) {

            this.errorMessage =
              response?.message ||
              'Failed to update configuration data.';

            this.saving = false;

            return;

          }


          // --------------------------------------------
          // SUCCESS
          // --------------------------------------------

          this.successMessage =
            response.message ||
            'Configuration updated successfully.';


          console.log(
            '✅ DATABASE UPDATE SUCCESS'
          );


          // --------------------------------------------
          // Close modal
          // --------------------------------------------

          this.showEditModal = false;

          this.editingRecord = {};

          this.originalSerialNumber = '';

          this.saving = false;


          // --------------------------------------------
          // Reload database data
          // --------------------------------------------

          this.loadConfigData();

          this.loadSummary();

        },

        error: (
          error: unknown
        ) => {

          console.error(
            '❌ UPDATE ERROR:',
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
            'Unable to update configuration data.';


          this.saving = false;

        }

      });

  }

}