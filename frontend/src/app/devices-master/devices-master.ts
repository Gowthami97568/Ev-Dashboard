import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  DevicesMasterService,
  DeviceListResponse,
  DeviceUpdateResponse
} from '../services/devices-master.service';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';


/*
 * IMPORTANT
 * ----------
 * These properties are explicitly declared because the Angular
 * template directly accesses them.
 *
 * The index signature is kept so that the component can still
 * display additional columns returned by the database.
 */
export interface DeviceMasterRecord {
  slno?: number | string;
  device_id?: string;
  reg_date?: string | null;
  status?: boolean | string | number | null;

  [key: string]: any;
}


@Component({
  selector: 'app-devices-master',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './devices-master.html',
  styleUrl: './devices-master.css'
})
export class DevicesMaster implements OnInit {

  // =====================================================
  // DEVICES
  // =====================================================

  devices: DeviceMasterRecord[] = [];

  columns: string[] = [];


  // =====================================================
  // SUMMARY
  // =====================================================

  summary = {
    total: 0
  };


  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';


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
  // DETAILS
  // =====================================================

  selectedDevice: DeviceMasterRecord | null = null;

  showDetails = false;


  // =====================================================
  // EDIT
  // =====================================================

  showEditModal = false;

  editingDevice: DeviceMasterRecord = {
    slno: '',
    device_id: '',
    reg_date: '',
    status: false
  };


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private readonly devicesMasterService: DevicesMasterService
  ) {}


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.loadDevices();
  }


  // =====================================================
  // LOAD DEVICES
  // =====================================================

  loadDevices(): void {

    this.loading = true;

    this.errorMessage = '';

    this.devicesMasterService
      .getDevices(
        this.page,
        this.limit,
        this.searchTerm
      )
      .subscribe({

        next: (response: DeviceListResponse) => {

          if (response.success && response.data) {

            this.devices =
              (response.data.items || []) as DeviceMasterRecord[];

            this.total =
              Number(
                response.data.pagination?.total || 0
              );

            this.page =
              Number(
                response.data.pagination?.page ||
                this.page
              );

            this.totalPages =
              Number(
                response.data.pagination?.totalPages || 0
              );

            this.summary.total = this.total;

            this.buildColumns();

          } else {

            this.devices = [];

            this.total = 0;

            this.totalPages = 0;

            this.summary.total = 0;

            this.columns = [];

            this.errorMessage =
              response.message ||
              'Failed to load devices.';
          }

          this.loading = false;
        },

        error: (error: unknown) => {

          console.error(
            'Devices Master API Error:',
            error
          );

          this.devices = [];

          this.total = 0;

          this.totalPages = 0;

          this.summary.total = 0;

          this.columns = [];

          this.errorMessage =
            'Unable to load devices from backend.';

          this.loading = false;
        }

      });
  }


  // =====================================================
  // BUILD COLUMNS
  // =====================================================

  private buildColumns(): void {

    if (this.devices.length === 0) {

      this.columns = [];

      return;
    }

    const firstDevice =
      this.devices[0];

    this.columns =
      Object.keys(firstDevice)
        .filter(
          column =>
            column !== '__v'
        );
  }


  // =====================================================
  // VISIBLE COLUMNS
  // =====================================================

  getVisibleColumns(): string[] {

    return this.columns;
  }


  // =====================================================
  // FORMAT COLUMN NAME
  // =====================================================

  formatColumnName(column: string): string {

    if (!column) {
      return '';
    }

    return column
      .replace(
        /([a-z])([A-Z])/g,
        '$1 $2'
      )
      .replace(
        /_/g,
        ' '
      )
      .replace(
        /^./,
        letter =>
          letter.toUpperCase()
      )
      .toUpperCase();
  }


  // =====================================================
  // FORMAT VALUE
  // =====================================================

  formatValue(value: any): string {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      return '—';
    }

    if (
      typeof value === 'object'
    ) {

      try {

        return JSON.stringify(value);

      } catch {

        return String(value);
      }
    }

    return String(value);
  }


  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDate(value: any): string {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {

      return '—';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(value);
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }


  // =====================================================
  // FORMAT STATUS
  // =====================================================

  formatStatus(value: any): string {

    if (
      value === true ||
      value === 1 ||
      String(value).toLowerCase() === 'true' ||
      String(value).toLowerCase() === 'active' ||
      String(value).toLowerCase() === 'enabled'
    ) {

      return 'Active';
    }

    if (
      value === false ||
      value === 0 ||
      value === null ||
      value === undefined ||
      String(value).toLowerCase() === 'false' ||
      String(value).toLowerCase() === 'inactive' ||
      String(value).toLowerCase() === 'disabled'
    ) {

      return 'Inactive';
    }

    return String(value);
  }


  // =====================================================
  // SEARCH
  // =====================================================

  applySearch(): void {

    this.page = 1;

    this.loadDevices();
  }


  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  clearSearch(): void {

    this.searchTerm = '';

    this.page = 1;

    this.loadDevices();
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

    this.loadDevices();
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

    this.loadDevices();
  }


  // =====================================================
  // DETAILS
  // =====================================================

  openDetails(
    device: DeviceMasterRecord
  ): void {

    this.selectedDevice = device;

    this.showDetails = true;
  }


  // =====================================================
  // CLOSE DETAILS
  // =====================================================

  closeDetails(): void {

    this.showDetails = false;

    this.selectedDevice = null;
  }


  // =====================================================
  // EDIT DEVICE
  // =====================================================

  editDevice(
    device: DeviceMasterRecord
  ): void {

    this.editingDevice = {
      ...device
    };

    this.errorMessage = '';

    this.successMessage = '';

    this.showEditModal = true;
  }


  // =====================================================
  // EDITABLE COLUMNS
  // =====================================================

  getEditableColumns(): string[] {

    return this.columns.filter(
      column =>
        !this.isDeviceIdColumn(column)
    );
  }


  // =====================================================
  // DEVICE ID COLUMN
  // =====================================================

  isDeviceIdColumn(
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
      normalized === 'deviceid' ||
      normalized === 'id'
    );
  }


  // =====================================================
  // CLOSE EDIT MODAL
  // =====================================================

  closeEditModal(): void {

    if (this.saving) {

      return;
    }

    this.showEditModal = false;

    this.editingDevice = {
      slno: '',
      device_id: '',
      reg_date: '',
      status: false
    };
  }


  // =====================================================
  // GET DEVICE ID
  // =====================================================

  private getDeviceId(
    device: DeviceMasterRecord
  ): string {

    const possibleKeys = [
      'device_id',
      'deviceid',
      'deviceId',
      'DEVICEID',
      'id',
      'ID'
    ];

    for (
      const key of possibleKeys
    ) {

      const value =
        device[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {

        return String(value).trim();
      }
    }

    return '';
  }


  // =====================================================
  // SAVE DEVICE
  // =====================================================

  saveDevice(): void {

    const deviceId =
      this.getDeviceId(
        this.editingDevice
      );

    if (!deviceId) {

      this.errorMessage =
        'Device ID is required.';

      return;
    }

    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    /*
     * Do not pass individual fields here.
     *
     * Send the complete edited object to the service.
     */
    const payload = {
      ...this.editingDevice
    };


    this.devicesMasterService
      .updateDevice(
        deviceId,
        payload
      )
      .subscribe({

        next: (
          response: DeviceUpdateResponse
        ) => {

          if (!response.success) {

            this.errorMessage =
              response.message ||
              'Failed to update device.';

            this.saving = false;

            return;
          }

          this.saving = false;

          this.showEditModal = false;

          this.editingDevice = {
            slno: '',
            device_id: '',
            reg_date: '',
            status: false
          };

          this.successMessage =
            response.message ||
            'Device updated successfully.';

          this.loadDevices();
        },

        error: (error: unknown) => {

          console.error(
            'Update device error:',
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
            'Unable to update device.';

          this.saving = false;
        }

      });
  }
}