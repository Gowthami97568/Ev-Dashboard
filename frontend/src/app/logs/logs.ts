import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';
import { LogsService } from './logs.service';

import {
  ChargeManagerService,
  Charger
} from '../services/charge-manager.service';


// =========================================================
// LOG INTERFACE
// =========================================================

interface LogRecord {
  type: string;
  date: string;
  time: string;
  message: string;
  deviceId: string;
}


// =========================================================
// COMPONENT
// =========================================================

@Component({
  selector: 'app-logs',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './logs.html',

  styleUrl: './logs.css'
})


export class Logs implements OnInit {

  // =========================================================
  // ALL REAL LOGS
  // =========================================================

  allLogs: LogRecord[] = [];

  filteredLogs: LogRecord[] = [];

  displayedLogs: LogRecord[] = [];


  // =========================================================
  // CHARGE MANAGER DATA
  // =========================================================

  chargeManagerRecords: Charger[] = [];

  deviceIds: string[] = [];

  selectedDeviceId = '';


  // =========================================================
  // DATE / TIME
  // =========================================================

  fromDateTime = '';

  toDateTime = '';

  get fromDateTimeDisplay(): string {
    return this.formatDateTimeDisplay(this.fromDateTime);
  }

  get toDateTimeDisplay(): string {
    return this.formatDateTimeDisplay(this.toDateTime);
  }


  // =========================================================
  // PAGINATION
  // =========================================================

  currentPage = 1;

  pageSize = 50;

  totalPages = 0;


  // =========================================================
  // LOADING / ERROR
  // =========================================================

  loading = true;

  errorMessage = '';


  // =========================================================
  // DEVICE REPORT
  // =========================================================

  showDeviceReport = false;

  reportDeviceId = '';

  reportTotalLogs = 0;

  reportInfoCount = 0;

  reportWarnCount = 0;

  reportErrorCount = 0;

  reportOtherCount = 0;

  reportFirstActivity = '-';

  reportLastActivity = '-';


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private readonly logsService: LogsService,

    private readonly chargeManagerService:
      ChargeManagerService
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    /*
     * Load Device IDs and Created Date
     * from Charge Manager.
     */
    this.loadChargeManager();


    /*
     * Load REAL logs.
     */
    this.loadLogs();
  }


  // =========================================================
  // LOAD CHARGE MANAGER
  // =========================================================

  private loadChargeManager(): void {

    const records: Charger[] = [];

    this.loadChargeManagerPage(
      1,
      records
    );
  }


  // =========================================================
  // LOAD ALL CHARGE MANAGER PAGES
  // =========================================================

  private loadChargeManagerPage(
    page: number,
    records: Charger[]
  ): void {

    this.chargeManagerService
      .getChargers(
        page,
        100,
        '',
        '',
        '',
        ''
      )
      .subscribe({

        next: (response) => {

          if (
            !response ||
            !response.success
          ) {

            console.warn(
              'Charge Manager returned no data.'
            );

            this.chargeManagerRecords =
              records;

            this.createDeviceIdList(
              records
            );

            return;
          }


          const chargers =
            response.data?.items ?? [];


          /*
           * Store all records.
           */
          records.push(
            ...chargers
          );


          const totalPages =
            Number(
              response.data?.pagination?.totalPages || 1
            );


          /*
           * Get remaining pages.
           */
          if (
            page < totalPages
          ) {

            this.loadChargeManagerPage(
              page + 1,
              records
            );

            return;
          }


          /*
           * All records loaded.
           */
          this.chargeManagerRecords =
            records;


          /*
           * Create Device ID dropdown.
           */
          this.createDeviceIdList(
            records
          );


          /*
           * If a device was already selected,
           * populate its date/time.
           */
          if (
            this.selectedDeviceId
          ) {

            this.setChargeManagerDateTime(
              this.selectedDeviceId
            );
          }


          console.log(
            'Charge Manager records:',
            this.chargeManagerRecords
          );


          console.log(
            'Device IDs:',
            this.deviceIds
          );
        },


        error: (error: unknown) => {

          console.error(
            'Charge Manager API Error:',
            error
          );

          this.chargeManagerRecords = [];

          this.deviceIds = [];
        }
      });
  }


  // =========================================================
  // CREATE DEVICE ID DROPDOWN
  // =========================================================

  private createDeviceIdList(
    records: Charger[]
  ): void {

    const ids =
      new Set<string>();


    for (
      const charger of records
    ) {

      const deviceId =
        String(
          charger.deviceid ?? ''
        ).trim();


      if (
        deviceId
      ) {

        ids.add(
          deviceId
        );
      }
    }


    this.deviceIds =
      Array.from(ids)
        .sort(
          (
            first,
            second
          ) =>
            first.localeCompare(
              second
            )
        );
  }


  // =========================================================
  // DEVICE ID CHANGE
  //
  // IMPORTANT:
  //
  // Selecting Device ID ONLY fills the date/time.
  //
  // It DOES NOT search the logs.
  //
  // User must click SEARCH.
  // =========================================================

  onDeviceChange(): void {

    /*
     * All Devices
     */
    if (
      !this.selectedDeviceId
    ) {

      this.fromDateTime = '';

      this.toDateTime = '';

      this.currentPage = 1;

      this.clearDeviceReport();

      /*
       * Do not automatically filter.
       */
      return;
    }


    const now = new Date();

    this.fromDateTime = this.formatDateTimeLocal(
      new Date(now.getTime() - 24 * 60 * 60 * 1000)
    );

    this.toDateTime = this.formatDateTimeLocal(now);

    this.currentPage = 1;

    this.clearDeviceReport();
  }


  // =========================================================
  // GET CHARGE MANAGER CREATED DATE
  //
  // Device ID
  //      ↓
  // Charge Manager
  //      ↓
  // createddate
  // =========================================================

  private setChargeManagerDateTime(
    deviceId: string
  ): void {

    const selectedId =
      this.normalizeDeviceId(
        deviceId
      );


    /*
     * Find EXACT same Device ID
     * in Charge Manager.
     */
    const charger =
      this.chargeManagerRecords.find(
        (
          item: Charger
        ) =>
          this.normalizeDeviceId(
            String(
              item.deviceid ?? ''
            )
          ) === selectedId
      );


    console.log(
      'Selected Device ID:',
      deviceId
    );


    console.log(
      'Matching Charge Manager Record:',
      charger
    );


    /*
     * Device not found.
     */
    if (
      !charger
    ) {

      this.fromDateTime = '';

      this.toDateTime = '';

      this.clearDeviceReport();

      console.warn(
        'Device ID not found in Charge Manager:',
        deviceId
      );

      return;
    }


    /*
     * Get Created Date.
     */
    const createdDate =
      this.getCreatedDate(
        charger
      );


    console.log(
      'Charge Manager Created Date:',
      createdDate
    );


    /*
     * Created Date missing.
     */
    if (
      !createdDate
    ) {

      this.fromDateTime = '';

      this.toDateTime = '';

      this.clearDeviceReport();

      console.warn(
        'Created Date not available for:',
        deviceId
      );

      return;
    }


    /*
     * Convert Created Date
     * to datetime-local format.
     */
    const formatted =
      this.formatDateTimeLocal(
        createdDate
      );


    // =======================================================
    // FROM = CHARGE MANAGER CREATED DATE
    // =======================================================

    this.fromDateTime =
      formatted;


    // =======================================================
    // TO = CURRENT DATE/TIME
    // =======================================================

    this.toDateTime =
      this.formatDateTimeLocal(
        new Date()
      );


    this.currentPage = 1;

    this.clearDeviceReport();


    console.log(
      'Automatic From Date & Time:',
      this.fromDateTime
    );


    console.log(
      'Automatic To Date & Time:',
      this.toDateTime
    );
  }


  // =========================================================
  // GET CREATED DATE FROM CHARGE MANAGER
  // =========================================================

  private getCreatedDate(
    charger: Charger
  ): Date | null {

    const record =
      charger as unknown as Record<
        string,
        unknown
      >;


    /*
     * createddate is the PRIMARY field.
     */
    const possibleKeys = [

      'createddate',

      'createdDate',

      'created_date',

      'createdAt',

      'created_at'
    ];


    for (
      const key of possibleKeys
    ) {

      const value =
        record[key];


      if (
        value === undefined ||
        value === null
      ) {

        continue;
      }


      const text =
        String(
          value
        ).trim();


      if (
        !text
      ) {

        continue;
      }


      const parsed =
        this.parseDate(
          text
        );


      if (
        parsed
      ) {

        return parsed;
      }
    }


    return null;
  }


  // =========================================================
  // PARSE DATE
  // =========================================================

  private parseDate(
    value: string
  ): Date | null {

    const text =
      value.trim();


    if (
      !text
    ) {

      return null;
    }


    /*
     * ISO:
     *
     * 2026-08-20T08:46:50.000Z
     */
    const isoDate =
      new Date(
        text
      );


    if (
      !Number.isNaN(
        isoDate.getTime()
      )
    ) {

      return isoDate;
    }


    /*
     * MySQL:
     *
     * 2026-08-20 08:46:50
     */
    const mysqlFormat =
      text.match(
        /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
      );


    if (
      mysqlFormat
    ) {

      const result =
        new Date(

          Number(
            mysqlFormat[1]
          ),

          Number(
            mysqlFormat[2]
          ) - 1,

          Number(
            mysqlFormat[3]
          ),

          Number(
            mysqlFormat[4] || 0
          ),

          Number(
            mysqlFormat[5] || 0
          ),

          Number(
            mysqlFormat[6] || 0
          ),

          0
        );


      if (
        !Number.isNaN(
          result.getTime()
        )
      ) {

        return result;
      }
    }


    /*
     * Server format:
     *
     * Sep-07-2026 10:00:45
     */
    const serverFormat =
      text.match(
        /^([A-Za-z]{3})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/
      );


    if (
      serverFormat
    ) {

      const months: Record<
        string,
        number
      > = {

        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
      };


      const month =
        months[
          serverFormat[1]
        ];


      if (
        month === undefined
      ) {

        return null;
      }


      const result =
        new Date(

          Number(
            serverFormat[3]
          ),

          month,

          Number(
            serverFormat[2]
          ),

          Number(
            serverFormat[4] || 0
          ),

          Number(
            serverFormat[5] || 0
          ),

          Number(
            serverFormat[6] || 0
          ),

          0
        );


      if (
        !Number.isNaN(
          result.getTime()
        )
      ) {

        return result;
      }
    }


    return null;
  }


  // =========================================================
  // FORMAT DATE/TIME FOR datetime-local
  // =========================================================

  private formatDateTimeLocal(
    date: Date
  ): string {

    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        '0'
      );


    const hours =
      String(
        date.getHours()
      ).padStart(
        2,
        '0'
      );


    const minutes =
      String(
        date.getMinutes()
      ).padStart(
        2,
        '0'
      );


    const seconds =
      String(
        date.getSeconds()
      ).padStart(
        2,
        '0'
      );


    return (
      `${year}-${month}-${day}` +
      `T${hours}:${minutes}:${seconds}`
    );
  }


  // =========================================================
  // FORMAT DATE/TIME FOR DISPLAY
  // =========================================================

  private formatDateTimeDisplay(
    value: string
  ): string {

    const match =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2})/
      );


    if (!match) {
      return '';
    }


    return `${match[2]}/${match[3]}/${match[1]} - ${match[4]}:00`;
  }


  // =========================================================
  // LOAD REAL LOGS
  // =========================================================

  loadLogs(deviceId = ''): void {

    this.loading = true;

    this.errorMessage = '';


    this.logsService
      .getLogs(deviceId)
      .subscribe({

        next: (
          response: string
        ) => {

          console.log(
            'REAL LOG SERVER RESPONSE:',
            response
          );


          this.allLogs =
            this.convertResponseToLogs(
              response
            );


          console.log(
            'TOTAL REAL LOGS:',
            this.allLogs.length
          );


          /*
           * Do NOT filter here.
           *
           * Search button will filter.
           */
          this.filteredLogs =
            this.allLogs;


          this.currentPage = 1;

          this.updatePagination();


          this.loading = false;
        },


        error: (
          error: unknown
        ) => {

          console.error(
            'REAL LOG API ERROR:',
            error
          );


          this.loading = false;

          this.errorMessage =
            'Unable to load logs from the server.';


          this.allLogs = [];

          this.filteredLogs = [];

          this.displayedLogs = [];

          this.clearDeviceReport();
        }
      });
  }


  // =========================================================
  // CONVERT SERVER RESPONSE
  // =========================================================

  private convertResponseToLogs(
    response: string
  ): LogRecord[] {

    const trimmed =
      (
        response ?? ''
      ).trim();


    if (
      !trimmed
    ) {

      return [];
    }


    // -------------------------------------------------------
    // JSON
    // -------------------------------------------------------

    if (
      trimmed.startsWith('{') ||
      trimmed.startsWith('[')
    ) {

      try {

        const parsed: unknown =
          JSON.parse(
            trimmed
          );


        const logs =
          this.convertJsonToLogs(
            parsed
          );


        if (
          logs.length > 0
        ) {

          return logs;
        }

      }
      catch {

        // Continue with HTML parsing.
      }
    }


    // -------------------------------------------------------
    // HTML
    // -------------------------------------------------------

    if (
      trimmed.includes('<table') ||
      trimmed.includes('<tbody') ||
      trimmed.includes('<tr')
    ) {

      const logs =
        this.parseHtmlTable(
          trimmed
        );


      if (
        logs.length > 0
      ) {

        return logs;
      }
    }


    // -------------------------------------------------------
    // PLAIN TEXT
    // -------------------------------------------------------

    return trimmed

      .split(
        /\r?\n/
      )

      .map(
        line =>
          this.parseLogLine(
            line
          )
      )

      .filter(
        (
          item
        ): item is LogRecord =>
          item !== null
      );
  }


  // =========================================================
  // PARSE HTML TABLE
  // =========================================================

  private parseHtmlTable(
    html: string
  ): LogRecord[] {

    const parser =
      new DOMParser();


    const document =
      parser.parseFromString(
        html,
        'text/html'
      );


    let rows =
      Array.from(
        document.querySelectorAll(
          'table tbody tr'
        )
      );


    if (
      rows.length === 0
    ) {

      rows =
        Array.from(
          document.querySelectorAll(
            'table tr'
          )
        );
    }


    const logs: LogRecord[] = [];


    for (
      const row of rows
    ) {

      const cells =
        Array.from(
          row.querySelectorAll(
            'td'
          )
        );


      if (
        cells.length < 3
      ) {

        continue;
      }


      const type =
        this.cleanText(
          cells[0].textContent
        );


      const dateTime =
        this.cleanText(
          cells[1].textContent
        );


      const message =
        this.cleanText(
          cells[2].textContent
        );


      if (
        !type &&
        !dateTime &&
        !message
      ) {

        continue;
      }


      /*
       * Ignore table header.
       */
      if (
        type.toLowerCase() === 'type'
      ) {

        continue;
      }


      const parts =
        this.splitServerDateTime(
          dateTime
        );


      const deviceId =
        this.extractDeviceId(
          message
        );


      logs.push({

        type:
          type.toLowerCase(),

        date:
          parts.date,

        time:
          parts.time,

        message,

        deviceId
      });
    }


    return logs;
  }


  // =========================================================
  // CLEAN TEXT
  // =========================================================

  private cleanText(
    value: string | null
  ): string {

    return (
      value ?? ''
    )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }


  // =========================================================
  // SPLIT SERVER DATE/TIME
  // =========================================================

  private splitServerDateTime(
    value: string
  ): {
    date: string;
    time: string;
  } {

    const cleaned =
      (
        value ?? ''
      ).trim();


    const match =
      cleaned.match(
        /^([A-Za-z]{3}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})/
      );


    if (
      match
    ) {

      return {

        date:
          match[1],

        time:
          match[2]
      };
    }


    /*
     * Fallback if server sends another format.
     */
    const parsed =
      new Date(
        cleaned
      );


    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {

      const months = [

        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];


      return {

        date:
          `${months[parsed.getMonth()]}-` +
          `${String(
            parsed.getDate()
          ).padStart(2, '0')}-` +
          `${parsed.getFullYear()}`,

        time:
          `${String(
            parsed.getHours()
          ).padStart(2, '0')}:` +
          `${String(
            parsed.getMinutes()
          ).padStart(2, '0')}:` +
          `${String(
            parsed.getSeconds()
          ).padStart(2, '0')}`
      };
    }


    return {

      date:
        cleaned,

      time:
        ''
    };
  }


  // =========================================================
  // PARSE PLAIN TEXT LOG
  // =========================================================

  private parseLogLine(
    line: string
  ): LogRecord | null {

    const trimmed =
      line.trim();


    if (
      !trimmed
    ) {

      return null;
    }


    const match =
      trimmed.match(
        /^(\S+)\s+([A-Za-z]{3}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})\s+([\s\S]*)$/
      );


    if (
      !match
    ) {

      return {

        type:
          'info',

        date:
          '',

        time:
          '',

        message:
          trimmed,

        deviceId:
          this.extractDeviceId(
            trimmed
          )
      };
    }


    const message =
      match[4].trim();


    return {

      type:
        match[1].toLowerCase(),

      date:
        match[2],

      time:
        match[3],

      message,

      deviceId:
        this.extractDeviceId(
          message
        )
    };
  }


  // =========================================================
  // JSON LOGS
  // =========================================================

  private convertJsonToLogs(
    response: unknown
  ): LogRecord[] {

    let records: unknown[] = [];


    if (
      Array.isArray(response)
    ) {

      records =
        response;
    }

    else if (
      response &&
      typeof response === 'object'
    ) {

      const data =
        response as Record<
          string,
          unknown
        >;


      if (
        Array.isArray(
          data['logs']
        )
      ) {

        records =
          data['logs'];
      }

      else if (
        Array.isArray(
          data['data']
        )
      ) {

        records =
          data['data'];
      }

      else if (
        Array.isArray(
          data['items']
        )
      ) {

        records =
          data['items'];
      }

      else if (
        Array.isArray(
          data['records']
        )
      ) {

        records =
          data['records'];
      }
    }


    return records

      .map(
        item =>
          this.convertSingleLog(
            item
          )
      )

      .filter(
        (
          item
        ): item is LogRecord =>
          item !== null
      );
  }


  // =========================================================
  // SINGLE JSON LOG
  // =========================================================

  private convertSingleLog(
    item: unknown
  ): LogRecord | null {

    if (
      !item ||
      typeof item !== 'object'
    ) {

      return null;
    }


    const record =
      item as Record<
        string,
        unknown
      >;


    const type =
      this.getValue(
        record,
        [
          'type',
          'logType',
          'log_type',
          'level',
          'severity'
        ]
      );


    const message =
      this.getValue(
        record,
        [
          'message',
          'msg',
          'logMessage',
          'log_message',
          'description',
          'details',
          'text'
        ]
      );


    let date =
      this.getValue(
        record,
        [
          'date',
          'logDate',
          'log_date'
        ]
      );


    let time =
      this.getValue(
        record,
        [
          'time',
          'logTime',
          'log_time'
        ]
      );


    const dateTime =
      this.getValue(
        record,
        [
          'dateTime',
          'datetime',
          'date_time',
          'timestamp',
          'createdAt',
          'created_at'
        ]
      );


    if (
      (!date || !time) &&
      dateTime
    ) {

      const parsed =
        this.splitDateTime(
          dateTime
        );


      if (
        !date
      ) {

        date =
          parsed.date;
      }


      if (
        !time
      ) {

        time =
          parsed.time;
      }
    }


    let deviceId =
      this.getValue(
        record,
        [
          'deviceId',
          'device_id',
          'deviceID',
          'chargerId',
          'charger_id'
        ]
      );


    if (
      !deviceId &&
      message
    ) {

      deviceId =
        this.extractDeviceId(
          message
        );
    }


    if (
      !type &&
      !date &&
      !time &&
      !message
    ) {

      return null;
    }


    return {

      type:
        type || 'info',

      date:
        this.formatDate(
          date
        ),

      time:
        this.formatTime(
          time
        ),

      message,

      deviceId
    };
  }


  // =========================================================
  // GET JSON VALUE
  // =========================================================

  private getValue(
    record: Record<
      string,
      unknown
    >,

    keys: string[]
  ): string {

    for (
      const key of keys
    ) {

      const value =
        record[key];


      if (
        value !== undefined &&
        value !== null
      ) {

        const result =
          String(
            value
          ).trim();


        if (
          result
        ) {

          return result;
        }
      }
    }


    return '';
  }


  // =========================================================
  // SPLIT DATE TIME
  // =========================================================

  private splitDateTime(
    value: string
  ): {
    date: string;
    time: string;
  } {

    if (
      !value
    ) {

      return {

        date:
          '',

        time:
          ''
      };
    }


    const serverFormat =
      value.match(
        /^([A-Za-z]{3}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})/
      );


    if (
      serverFormat
    ) {

      return {

        date:
          serverFormat[1],

        time:
          serverFormat[2]
      };
    }


    const parsed =
      new Date(
        value
      );


    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {

      const months = [

        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];


      return {

        date:
          `${months[parsed.getMonth()]}-` +
          `${String(
            parsed.getDate()
          ).padStart(2, '0')}-` +
          `${parsed.getFullYear()}`,

        time:
          `${String(
            parsed.getHours()
          ).padStart(2, '0')}:` +
          `${String(
            parsed.getMinutes()
          ).padStart(2, '0')}:` +
          `${String(
            parsed.getSeconds()
          ).padStart(2, '0')}`
      };
    }


    return {

      date:
        value,

      time:
        ''
    };
  }


  // =========================================================
  // FORMAT DATE
  // =========================================================

  private formatDate(
    value: string
  ): string {

    if (
      !value
    ) {

      return '';
    }


    const parsed =
      this.splitDateTime(
        value
      );


    if (
      parsed.date &&
      parsed.date !== value
    ) {

      return parsed.date;
    }


    return value;
  }


  // =========================================================
  // FORMAT TIME
  // =========================================================

  private formatTime(
    value: string
  ): string {

    if (
      !value
    ) {

      return '';
    }


    const match =
      value.match(
        /(\d{2}):(\d{2}):(\d{2})/
      );


    if (
      match
    ) {

      return (
        `${match[1]}:` +
        `${match[2]}:` +
        `${match[3]}`
      );
    }


    return value;
  }


  // =========================================================
  // EXTRACT DEVICE ID FROM REAL LOG MESSAGE
  // =========================================================

  private extractDeviceId(
    message: string
  ): string {

    if (
      !message
    ) {

      return '';
    }


    const patterns: RegExp[] = [

      /*
       * Heartbeat:
       *
       * Heartbeat Data Received from : cm3333thb5
       */
      /Received\s+from\s*:\s*([A-Za-z0-9_-]+)/i,


      /*
       * Data Sent:
       *
       * Data Sent To : cm3333thb5
       */
      /Sent\s+To\s*:\s*([A-Za-z0-9_-]+)/i,


      /*
       * Long Run:
       *
       * stopping: cm3334thb6
       */
      /stopping\s*:\s*([A-Za-z0-9_-]+)/i,


      /*
       * Other possible formats.
       */
      /device\s*id\s*:\s*([A-Za-z0-9_-]+)/i,

      /charger\s*id\s*:\s*([A-Za-z0-9_-]+)/i
    ];


    for (
      const pattern of patterns
    ) {

      const match =
        message.match(
          pattern
        );


      if (
        match &&
        match[1]
      ) {

        return match[1].trim();
      }
    }


    return '';
  }


  // =========================================================
  // NORMALIZE DEVICE ID
  // =========================================================

  private normalizeDeviceId(
    value: string
  ): string {

    return (
      value ?? ''
    )
      .trim()
      .toLowerCase();
  }


  // =========================================================
  // CHECK LOG DEVICE ID
  //
  // First use parsed deviceId.
  // If unavailable, check the REAL MESSAGE directly.
  // =========================================================

  private logBelongsToDevice(
    log: LogRecord,
    selectedDeviceId: string
  ): boolean {

    const selected =
      this.normalizeDeviceId(
        selectedDeviceId
      );


    /*
     * First check parsed Device ID.
     */
    const parsedId =
      this.normalizeDeviceId(
        log.deviceId
      );


    if (
      parsedId === selected
    ) {

      return true;
    }


    /*
     * If parser did not extract an ID,
     * extract it directly from the message.
     */
    const messageDeviceId =
      this.normalizeDeviceId(
        this.extractDeviceId(
          log.message
        )
      );


    if (
      messageDeviceId === selected
    ) {

      return true;
    }


    return false;
  }


  // =========================================================
  // SEARCH
  //
  // THIS IS THE ACTUAL SEARCH.
  // =========================================================

  searchLogs(): void {

    console.log(
      '================ SEARCH ================'
    );


    console.log(
      'Selected Device ID:',
      this.selectedDeviceId
    );


    console.log(
      'From Date & Time:',
      this.fromDateTime
    );


    console.log(
      'To Date & Time:',
      this.toDateTime
    );


    /*
     * A selected device is loaded from the server without the default
     * 100-row cap, so the local filters operate on its complete history.
     */
    this.currentPage = 1;

    if (this.selectedDeviceId) {
      this.loadLogsForSearch();
      return;
    }

    this.applyFilters();


    console.log(
      'Matching Logs:',
      this.filteredLogs.length
    );


    console.log(
      '========================================'
    );
  }

  private loadLogsForSearch(): void {
    this.loading = true;
    this.errorMessage = '';

    this.logsService
      .getLogs(
        this.selectedDeviceId,
        this.fromDateTime,
        this.toDateTime
      )
      .subscribe({
        next: (response: string) => {
          this.allLogs = this.convertResponseToLogs(response);
          this.applyFilters();
          this.loading = false;
        },
        error: (error: unknown) => {
          console.error('DEVICE LOG API ERROR:', error);
          this.errorMessage = 'Unable to load logs for the selected device.';
          this.filteredLogs = [];
          this.displayedLogs = [];
          this.loading = false;
        }
      });
  }


  // =========================================================
  // APPLY ALL SEARCH FILTERS
  //
  // Device ID
  // +
  // From Date/Time
  // +
  // To Date/Time
  // =========================================================

  private applyFilters(): void {

    const from =
      this.getFilterTimestamp(
        this.fromDateTime,
        false
      );


    const to =
      this.getFilterTimestamp(
        this.toDateTime,
        true
      );


    console.log(
      'From timestamp:',
      from
    );


    console.log(
      'To timestamp:',
      to
    );


    this.filteredLogs =
      this.allLogs.filter(
        (
          log: LogRecord
        ) => {

          // =================================================
          // 1. DEVICE ID FILTER
          // =================================================

          if (
            this.selectedDeviceId
          ) {

            const matchesDevice =
              this.logBelongsToDevice(
                log,
                this.selectedDeviceId
              );


            if (
              !matchesDevice
            ) {

              return false;
            }
          }


          // =================================================
          // 2. LOG DATE/TIME
          // =================================================

          const logDate =
            this.createLogDate(
              log
            );


          /*
           * If date filtering is active,
           * a log without a valid date cannot match.
           */
          if (
            (
              from !== null ||
              to !== null
            ) &&
            !logDate
          ) {

            return false;
          }


          /*
           * If no date exists and no date filter,
           * keep the log.
           */
          if (
            !logDate
          ) {

            return true;
          }


          const timestamp =
            logDate.getTime();


          // =================================================
          // 3. FROM DATE/TIME
          // =================================================

          if (
            from !== null &&
            timestamp < from
          ) {

            return false;
          }


          // =================================================
          // 4. TO DATE/TIME
          // =================================================

          if (
            to !== null &&
            timestamp > to
          ) {

            return false;
          }


          return true;
        }
      );


    // =======================================================
    // PAGINATION
    // =======================================================

    this.updatePagination();


    // =======================================================
    // DEVICE REPORT
    // =======================================================

    if (
      this.selectedDeviceId
    ) {

      this.createDeviceReport();

    }
    else {

      this.clearDeviceReport();
    }
  }


  // =========================================================
  // FILTER TIMESTAMP
  // =========================================================

  private getFilterTimestamp(
    value: string,
    isToDate: boolean
  ): number | null {

    if (
      !value
    ) {

      return null;
    }


    const match =
      value.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
      );


    if (
      !match
    ) {

      return null;
    }


    let seconds =
      Number(
        match[6] || 0
      );


    let milliseconds = 0;


    /*
     * If To does not contain seconds,
     * include the whole minute.
     */
    if (
      isToDate &&
      match[6] === undefined
    ) {

      seconds = 59;

      milliseconds = 999;
    }


    const result =
      new Date(

        Number(
          match[1]
        ),

        Number(
          match[2]
        ) - 1,

        Number(
          match[3]
        ),

        Number(
          match[4]
        ),

        Number(
          match[5]
        ),

        seconds,

        milliseconds
      );


    if (
      Number.isNaN(
        result.getTime()
      )
    ) {

      return null;
    }


    return result.getTime();
  }


  // =========================================================
  // CREATE DATE FROM REAL LOG
  // =========================================================

  private createLogDate(
    log: LogRecord
  ): Date | null {

    if (
      !log.date ||
      !log.time
    ) {

      return null;
    }


    const value =
      `${log.date.trim()} ${log.time.trim()}`;


    /*
     * Real server format:
     *
     * Sep-07-2026 10:07:14
     */
    const match =
      value.match(
        /^([A-Za-z]{3})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/
      );


    if (
      !match
    ) {

      /*
       * Try normal Date parser as fallback.
       */
      const parsed =
        new Date(
          value
        );


      if (
        !Number.isNaN(
          parsed.getTime()
        )
      ) {

        return parsed;
      }


      return null;
    }


    const months: Record<
      string,
      number
    > = {

      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11
    };


    const month =
      months[
        match[1]
      ];


    if (
      month === undefined
    ) {

      return null;
    }


    const result =
      new Date(

        Number(
          match[3]
        ),

        month,

        Number(
          match[2]
        ),

        Number(
          match[4]
        ),

        Number(
          match[5]
        ),

        Number(
          match[6]
        ),

        0
      );


    if (
      Number.isNaN(
        result.getTime()
      )
    ) {

      return null;
    }


    return result;
  }


  // =========================================================
  // PAGINATION
  // =========================================================

  private updatePagination(): void {

    this.totalPages =
      Math.ceil(
        this.filteredLogs.length /
        this.pageSize
      );


    if (
      this.totalPages === 0
    ) {

      this.currentPage = 1;

    }
    else if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;
    }


    this.updateDisplayedLogs();
  }


  // =========================================================
  // UPDATE DISPLAYED LOGS
  // =========================================================

  private updateDisplayedLogs(): void {

    const start =
      (
        this.currentPage - 1
      ) *
      this.pageSize;


    const end =
      start +
      this.pageSize;


    this.displayedLogs =
      this.filteredLogs.slice(
        start,
        end
      );
  }


  // =========================================================
  // CREATE DEVICE REPORT
  // =========================================================

  private createDeviceReport(): void {

    this.showDeviceReport = true;


    this.reportDeviceId =
      this.selectedDeviceId;


    this.reportTotalLogs =
      this.filteredLogs.length;


    this.reportInfoCount = 0;

    this.reportWarnCount = 0;

    this.reportErrorCount = 0;

    this.reportOtherCount = 0;


    for (
      const log of this.filteredLogs
    ) {

      const type =
        (
          log.type || ''
        )
          .toLowerCase()
          .trim();


      if (
        type === 'info'
      ) {

        this.reportInfoCount++;

      }
      else if (
        type === 'warn' ||
        type === 'warning'
      ) {

        this.reportWarnCount++;

      }
      else if (
        type === 'error'
      ) {

        this.reportErrorCount++;

      }
      else {

        this.reportOtherCount++;
      }
    }


    const dates =
      this.filteredLogs

        .map(
          log =>
            this.createLogDate(
              log
            )
        )

        .filter(
          (
            date
          ): date is Date =>
            date !== null
        )

        .sort(
          (
            first,
            second
          ) =>
            first.getTime() -
            second.getTime()
        );


    if (
      dates.length > 0
    ) {

      this.reportFirstActivity =
        this.formatReportDate(
          dates[0]
        );


      this.reportLastActivity =
        this.formatReportDate(
          dates[
            dates.length - 1
          ]
        );

    }
    else {

      this.reportFirstActivity = '-';

      this.reportLastActivity = '-';
    }
  }


  // =========================================================
  // CLEAR DEVICE REPORT
  // =========================================================

  private clearDeviceReport(): void {

    this.showDeviceReport = false;

    this.reportDeviceId = '';

    this.reportTotalLogs = 0;

    this.reportInfoCount = 0;

    this.reportWarnCount = 0;

    this.reportErrorCount = 0;

    this.reportOtherCount = 0;

    this.reportFirstActivity = '-';

    this.reportLastActivity = '-';
  }


  // =========================================================
  // REPORT DATE FORMAT
  // =========================================================

  private formatReportDate(
    date: Date
  ): string {

    const months = [

      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];


    return (

      `${months[date.getMonth()]}-` +

      `${String(
        date.getDate()
      ).padStart(2, '0')}-` +

      `${date.getFullYear()} ` +

      `${String(
        date.getHours()
      ).padStart(2, '0')}:` +

      `${String(
        date.getMinutes()
      ).padStart(2, '0')}:` +

      `${String(
        date.getSeconds()
      ).padStart(2, '0')}`
    );
  }


  // =========================================================
  // EXPORT
  // =========================================================

  exportDeviceReport(): void {

    if (
      !this.selectedDeviceId
    ) {

      console.warn(
        'Please select a Device ID.'
      );

      return;
    }


    if (
      this.filteredLogs.length === 0
    ) {

      console.warn(
        'No logs available for export.'
      );

      return;
    }


    const rows: string[][] = [];


    rows.push([
      'DEVICE REPORT'
    ]);


    rows.push([
      'Device ID',
      this.reportDeviceId
    ]);


    rows.push([
      'Total Logs',
      String(
        this.reportTotalLogs
      )
    ]);


    rows.push([
      'INFO',
      String(
        this.reportInfoCount
      )
    ]);


    rows.push([
      'WARN',
      String(
        this.reportWarnCount
      )
    ]);


    rows.push([
      'ERROR',
      String(
        this.reportErrorCount
      )
    ]);


    if (
      this.reportOtherCount > 0
    ) {

      rows.push([
        'OTHER',
        String(
          this.reportOtherCount
        )
      ]);
    }


    rows.push([
      'First Activity',
      this.reportFirstActivity
    ]);


    rows.push([
      'Last Activity',
      this.reportLastActivity
    ]);


    rows.push([
      'From Date & Time',
      this.fromDateTime
    ]);


    rows.push([
      'To Date & Time',
      this.toDateTime
    ]);


    rows.push([]);


    rows.push([
      'Type',
      'Date',
      'Time',
      'Device ID',
      'Message'
    ]);


    for (
      const log of this.filteredLogs
    ) {

      rows.push([

        log.type,

        log.date,

        log.time,

        log.deviceId,

        log.message
      ]);
    }


    const csvContent =
      rows

        .map(
          row =>
            row

              .map(
                value =>
                  this.escapeCsvValue(
                    value
                  )
              )

              .join(',')
        )

        .join('\r\n');


    const csv =
      '\uFEFF' +
      csvContent;


    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );


    link.href =
      url;


    const safeDeviceId =
      this.reportDeviceId
        .replace(
          /[^a-zA-Z0-9_-]/g,
          '_'
        );


    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(
        2,
        '0'
      );


    const day =
      String(
        now.getDate()
      ).padStart(
        2,
        '0'
      );


    link.download =
      `Device_Report_${safeDeviceId}_${year}-${month}-${day}.csv`;


    document.body.appendChild(
      link
    );


    link.click();


    document.body.removeChild(
      link
    );


    URL.revokeObjectURL(
      url
    );
  }


  // =========================================================
  // CSV ESCAPE
  // =========================================================

  private escapeCsvValue(
    value: string
  ): string {

    const text =
      String(
        value ?? ''
      );


    if (
      text.includes(',') ||
      text.includes('"') ||
      text.includes('\n') ||
      text.includes('\r')
    ) {

      return (
        '"' +
        text.replace(
          /"/g,
          '""'
        ) +
        '"'
      );
    }


    return text;
  }


  // =========================================================
  // RESET
  // =========================================================

  resetFilters(): void {

    this.selectedDeviceId = '';

    this.fromDateTime = '';

    this.toDateTime = '';

    this.currentPage = 1;

    this.errorMessage = '';

    this.clearDeviceReport();


    /*
     * Show all REAL logs again.
     */
    this.filteredLogs =
      this.allLogs;


    this.updatePagination();
  }


  // =========================================================
  // REFRESH
  // =========================================================

  refreshLogs(): void {

    this.loadChargeManager();

    this.loadLogs();
  }


  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  previousPage(): void {

    if (
      this.currentPage <= 1
    ) {

      return;
    }


    this.currentPage--;

    this.updateDisplayedLogs();
  }


  // =========================================================
  // NEXT PAGE
  // =========================================================

  nextPage(): void {

    if (
      this.currentPage >=
      this.totalPages
    ) {

      return;
    }


    this.currentPage++;

    this.updateDisplayedLogs();
  }


  // =========================================================
  // GO TO PAGE
  // =========================================================

  goToPage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;
    }


    this.currentPage =
      page;

    this.updateDisplayedLogs();
  }


  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  getPageNumbers(): number[] {

    const pages: number[] = [];

    const maxPages = 5;


    let start =
      Math.max(
        1,
        this.currentPage - 2
      );


    const end =
      Math.min(
        this.totalPages,
        start + maxPages - 1
      );


    if (
      end - start + 1 <
      maxPages
    ) {

      start =
        Math.max(
          1,
          end - maxPages + 1
        );
    }


    for (
      let page = start;
      page <= end;
      page++
    ) {

      pages.push(
        page
      );
    }


    return pages;
  }


  // =========================================================
  // START RECORD
  // =========================================================

  get startRecord(): number {

    if (
      this.filteredLogs.length === 0
    ) {

      return 0;
    }


    return (
      (
        this.currentPage - 1
      ) *
      this.pageSize
    ) + 1;
  }


  // =========================================================
  // END RECORD
  // =========================================================

  get endRecord(): number {

    return Math.min(

      this.currentPage *
      this.pageSize,

      this.filteredLogs.length
    );
  }

}