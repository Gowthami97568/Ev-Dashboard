import {
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ChargeManagerService,
  Charger,
  ChargerSummary
} from '../services/charge-manager.service';

import {
  Sidebar
} from '../dashboard/components/sidebar/sidebar';

@Component({
  selector: 'app-charge-manager',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './charge-manager.html',

  styleUrl: './charge-manager.css'
})
export class ChargeManager implements OnInit {


  // =====================================================
  // DATA
  // =====================================================

  chargers: Charger[] = [];


  // =====================================================
  // SUMMARY
  // =====================================================

  summary: ChargerSummary = {

    total: 0,

    active: 0,

    inactive: 0,

    fullDay: 0

  };


  // =====================================================
  // FILTERS
  // =====================================================

  searchTerm = '';

  activeFilter = '';

  deviceTypeFilter = '';

  countryFilter = '';


  // =====================================================
  // PAGINATION
  // =====================================================

  page = 1;

  limit = 10;

  total = 0;

  totalPages = 0;


  // =====================================================
  // STATES
  // =====================================================

  loading = false;

  saving = false;

  errorMessage = '';

  successMessage = '';


  // =====================================================
  // EDIT
  // =====================================================

  showEditModal = false;

  editingCharger: Charger = {};


  constructor(
    private readonly chargeManagerService:
      ChargeManagerService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.loadChargers();

  }


  // =====================================================
  // LOAD CHARGERS + SUMMARY
  // =====================================================

  loadChargers(): void {

    this.loading = true;

    this.errorMessage = '';


    this.chargeManagerService

      .getChargers(

        this.page,

        this.limit,

        this.searchTerm,

        this.activeFilter,

        this.deviceTypeFilter,

        this.countryFilter

      )

      .subscribe({

        next: (response) => {


          // =============================================
          // CHECK RESPONSE
          // =============================================

          if (!response.success) {

            this.errorMessage =
              response.message ||
              'Failed to load chargers.';

            this.loading = false;

            return;
          }


          // =============================================
          // CHARGER ROWS
          // =============================================

          this.chargers =
            response.data.items || [];


          // =============================================
          // PAGINATION
          // =============================================

          this.page =
            Number(
              response.data.pagination?.page ||
              1
            );


          this.limit =
            Number(
              response.data.pagination?.limit ||
              this.limit
            );


          this.total =
            Number(
              response.data.pagination?.total ||
              0
            );


          this.totalPages =
            Number(
              response.data.pagination?.totalPages ||
              0
            );


          // =============================================
          // LOAD REAL SUMMARY FROM DATABASE
          // =============================================

          this.loadSummary();

        },


        error: (error: unknown) => {

          console.error(
            'Load chargers error:',
            error
          );

          this.errorMessage =
            'Unable to load chargers. Please check the backend.';

          this.loading = false;

        }

      });

  }


  // =====================================================
  // LOAD SUMMARY
  // =====================================================

  private loadSummary(): void {

    this.chargeManagerService

      .getChargerSummary()

      .subscribe({

        next: (response) => {

          if (response.success) {

            this.summary =
              response.data;

          }

          this.loading = false;

        },


        error: (error: unknown) => {

          console.error(
            'Load charger summary error:',
            error
          );

          this.errorMessage =
            'Chargers loaded, but summary could not be loaded.';

          this.loading = false;

        }

      });

  }


  // =====================================================
  // SEARCH
  // =====================================================

  applyFilters(): void {

    this.page = 1;

    this.loadChargers();

  }


  // =====================================================
  // STATUS FILTER
  // =====================================================

  onStatusFilterChange(): void {

    this.page = 1;

    this.loadChargers();

  }


  // =====================================================
  // CLEAR
  // =====================================================

  clearFilters(): void {

    this.searchTerm = '';

    this.activeFilter = '';

    this.deviceTypeFilter = '';

    this.countryFilter = '';

    this.page = 1;

    this.loadChargers();

  }


  // =====================================================
  // PREVIOUS PAGE
  // =====================================================

  previousPage(): void {

    if (

      this.page <= 1 ||

      this.total === 0

    ) {

      return;

    }

    this.page--;

    this.loadChargers();

  }


  // =====================================================
  // NEXT PAGE
  // =====================================================

  nextPage(): void {

    if (

      this.page >= this.totalPages ||

      this.total === 0

    ) {

      return;

    }

    this.page++;

    this.loadChargers();

  }


  // =====================================================
  // ACTIVE STATUS
  // =====================================================

  isActive(
    charger: Charger
  ): boolean {

    return (

      charger.active === 1 ||

      charger.active === true ||

      charger.active === '1'

    );

  }


  // =====================================================
  // EDIT
  // =====================================================

  editCharger(
    charger: Charger
  ): void {

    this.editingCharger = {

      ...charger

    };

    this.showEditModal = true;

    this.errorMessage = '';

    this.successMessage = '';

  }


  // =====================================================
  // CLOSE EDIT
  // =====================================================

  closeEditModal(): void {

    if (this.saving) {

      return;

    }

    this.showEditModal = false;

    this.editingCharger = {};

  }


  // =====================================================
  // SAVE
  // =====================================================

  saveCharger(): void {

    const deviceId =
      String(
        this.editingCharger.deviceid ?? ''
      ).trim();


    // ================================================
    // VALIDATION
    // ================================================

    if (!deviceId) {

      this.errorMessage =
        'Device ID is required.';

      return;

    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    // ================================================
    // NORMALIZE VALUES
    // ================================================

    const payload: Charger = {

      ...this.editingCharger,


      active:

        this.editingCharger.active === 1 ||

        this.editingCharger.active === true ||

        this.editingCharger.active === '1'

          ? 1

          : 0,


      fullday:

        this.editingCharger.fullday === 1 ||

        this.editingCharger.fullday === true ||

        this.editingCharger.fullday === '1'

          ? 1

          : 0

    };


    console.log(
      'Saving charger:',
      payload
    );


    // ================================================
    // UPDATE DATABASE
    // ================================================

    this.chargeManagerService

      .updateCharger(

        deviceId,

        payload

      )

      .subscribe({

        next: (response) => {

          console.log(
            'Update response:',
            response
          );


          if (!response.success) {

            this.errorMessage =
              response.message ||
              'Failed to update charger.';

            this.saving = false;

            return;

          }


          // ==========================================
          // SUCCESS
          // ==========================================

          this.saving = false;

          this.showEditModal = false;

          this.editingCharger = {};


          this.successMessage =
            response.message ||
            'Charger updated successfully.';


          // ==========================================
          // RELOAD ACTUAL DATABASE DATA
          // ==========================================

          this.loadChargers();

        },


        error: (error: unknown) => {

          console.error(
            'Update charger error:',
            error
          );

          this.errorMessage =
            'Unable to update charger.';

          this.saving = false;

        }

      });

  }

}