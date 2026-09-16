import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Sidebar } from '../dashboard/components/sidebar/sidebar';
import { LogsService } from '../logs/logs.service';

interface ServerLog {
  id: number;
  level: string;
  service: string;
  message: string;
  status: string;
  timestamp: string;
}

@Component({
  selector: 'app-server-logs',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    Sidebar
  ],

  templateUrl: './server-logs.html',
  styleUrl: './server-logs.css'
})
export class ServerLogs implements OnInit {

  /* =========================================================
     SEARCH
  ========================================================= */

  searchText = '';


  /* =========================================================
     REAL SERVER LOG DATA
  ========================================================= */

  serverLogs: ServerLog[] = [];

  filteredLogs: ServerLog[] = [];

  displayedLogs: ServerLog[] = [];


  /* =========================================================
     PAGINATION
  ========================================================= */

  currentPage = 1;

  pageSize = 50;

  totalPages = 0;


  /* =========================================================
     STATE
  ========================================================= */

  loading = true;

  errorMessage = '';


  /* =========================================================
     CONSTRUCTOR
  ========================================================= */

  constructor(
    private readonly logsService: LogsService
  ) {}


  /* =========================================================
     INIT
  ========================================================= */

  ngOnInit(): void {
    this.loadServerLogs();
  }


  /* =========================================================
     LOAD REAL SERVER LOGS
  ========================================================= */

  loadServerLogs(): void {

    this.loading = true;

    this.errorMessage = '';

    this.logsService.getServerLogs().subscribe({

      next: (response: string) => {

        console.log(
          'REAL SERVER LOG RESPONSE:',
          response
        );


        this.serverLogs =
          this.convertResponseToLogs(
            response
          );


        console.log(
          'TOTAL REAL SERVER LOGS:',
          this.serverLogs.length
        );


        this.currentPage = 1;

        this.applySearch();

        this.loading = false;

      },


      error: (error: unknown) => {

        console.error(
          'SERVER LOG API ERROR:',
          error
        );


        this.serverLogs = [];

        this.filteredLogs = [];

        this.displayedLogs = [];

        this.totalPages = 0;


        this.errorMessage =
          'Unable to load server logs from the server.';


        this.loading = false;

      }

    });

  }


  /* =========================================================
     REFRESH
  ========================================================= */

  refreshLogs(): void {

    this.loadServerLogs();

  }


  /* =========================================================
     SEARCH
  ========================================================= */

  onSearchChange(): void {

    this.currentPage = 1;

    this.applySearch();

  }


  /* =========================================================
     APPLY SEARCH
  ========================================================= */

  private applySearch(): void {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredLogs = [
        ...this.serverLogs
      ];

    } else {

      this.filteredLogs =
        this.serverLogs.filter(
          (
            log: ServerLog
          ) => {

            return (

              String(log.id)
                .toLowerCase()
                .includes(search)

              ||

              log.level
                .toLowerCase()
                .includes(search)

              ||

              log.service
                .toLowerCase()
                .includes(search)

              ||

              log.message
                .toLowerCase()
                .includes(search)

              ||

              log.status
                .toLowerCase()
                .includes(search)

              ||

              log.timestamp
                .toLowerCase()
                .includes(search)

            );

          }
        );

    }


    this.updatePagination();

  }


  /* =========================================================
     PAGINATION
  ========================================================= */

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

      this.displayedLogs = [];

      return;

    }


    if (
      this.currentPage >
      this.totalPages
    ) {

      this.currentPage =
        this.totalPages;

    }


    const startIndex =
      (
        this.currentPage - 1
      ) *
      this.pageSize;


    const endIndex =
      startIndex +
      this.pageSize;


    this.displayedLogs =
      this.filteredLogs.slice(
        startIndex,
        endIndex
      );

  }


  /* =========================================================
     PREVIOUS PAGE
  ========================================================= */

  previousPage(): void {

    if (
      this.currentPage > 1
    ) {

      this.currentPage--;

      this.updatePagination();

    }

  }


  /* =========================================================
     NEXT PAGE
  ========================================================= */

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

      this.updatePagination();

    }

  }


  /* =========================================================
     GO TO PAGE
  ========================================================= */

  goToPage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {

      return;

    }


    this.currentPage = page;

    this.updatePagination();

  }


  /* =========================================================
     PAGE NUMBERS
  ========================================================= */

  getPageNumbers(): number[] {

    if (
      this.totalPages === 0
    ) {

      return [];

    }


    const pages: number[] = [];


    /*
     * Show all pages when there are only a few.
     */

    if (
      this.totalPages <= 7
    ) {

      for (
        let page = 1;
        page <= this.totalPages;
        page++
      ) {

        pages.push(page);

      }


      return pages;

    }


    /*
     * For many pages, show a compact set.
     */

    pages.push(1);


    if (
      this.currentPage > 4
    ) {

      pages.push(-1);

    }


    const start =
      Math.max(
        2,
        this.currentPage - 1
      );


    const end =
      Math.min(
        this.totalPages - 1,
        this.currentPage + 1
      );


    for (
      let page = start;
      page <= end;
      page++
    ) {

      if (
        !pages.includes(page)
      ) {

        pages.push(page);

      }

    }


    if (
      this.currentPage <
      this.totalPages - 3
    ) {

      pages.push(-1);

    }


    if (
      !pages.includes(
        this.totalPages
      )
    ) {

      pages.push(
        this.totalPages
      );

    }


    return pages;

  }


  /* =========================================================
     START RECORD
  ========================================================= */

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


  /* =========================================================
     END RECORD
  ========================================================= */

  get endRecord(): number {

    if (
      this.filteredLogs.length === 0
    ) {

      return 0;

    }


    return Math.min(

      this.currentPage *
      this.pageSize,

      this.filteredLogs.length

    );

  }


  formatTimestamp(
    timestamp: string
  ): string {

    return timestamp
      .replace(
        /(\d{1,2}:\d{2}):\d{2}$/,
        '$1'
      )
      .replace(
        /^([A-Za-z]{3})/,
        match => match.toLowerCase()
      );

  }


  /* =========================================================
     COUNTS
  ========================================================= */

  getCount(
    status: string
  ): number {

    const requested =
      (
        status ?? ''
      )
        .trim()
        .toLowerCase();


    return this.filteredLogs.filter(
      (
        log: ServerLog
      ) =>
        (
          log.status ?? ''
        )
          .trim()
          .toLowerCase() ===
        requested
    ).length;

  }


  /* =========================================================
     CONVERT SERVER RESPONSE
  ========================================================= */

  private convertResponseToLogs(
    response: string
  ): ServerLog[] {

    const trimmed =
      (
        response ?? ''
      ).trim();


    if (!trimmed) {

      return [];

    }


    /*
     * JSON
     */

    if (
      trimmed.startsWith('{') ||
      trimmed.startsWith('[')
    ) {

      try {

        const parsed: unknown =
          JSON.parse(trimmed);


        const logs =
          this.convertJsonToLogs(
            parsed
          );


        if (
          logs.length > 0
        ) {

          return logs;

        }

      } catch {

        // Continue with HTML.

      }

    }


    /*
     * REAL HTML TABLE
     */

    if (
      trimmed.includes('<table') ||
      trimmed.includes('<tr')
    ) {

      return this.parseHtmlTable(
        trimmed
      );

    }


    /*
     * Plain text
     */

    return trimmed
      .split(/\r?\n/)
      .map(
        (
          line: string,
          index: number
        ) =>
          this.parseTextLine(
            line,
            index + 1
          )
      )
      .filter(
        (
          log
        ): log is ServerLog =>
          log !== null
      );

  }


  /* =========================================================
     PARSE HTML TABLE
  ========================================================= */

  private parseHtmlTable(
    html: string
  ): ServerLog[] {

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


    const logs: ServerLog[] = [];


    let id = 1;


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
       * Skip table header.
       */

      if (
        type.toLowerCase() === 'type'
      ) {

        continue;

      }


      logs.push({

        id,

        level:
          type.toUpperCase(),

        /*
         * The actual server log does not
         * provide a separate service.
         */
        service: '',

        message,

        status:
          this.getStatusFromLevel(
            type
          ),

        timestamp:
          dateTime

      });


      id++;

    }


    return logs;

  }


  /* =========================================================
     PARSE TEXT LOG
  ========================================================= */

  private parseTextLine(
    line: string,
    id: number
  ): ServerLog | null {

    const trimmed =
      line.trim();


    if (!trimmed) {

      return null;

    }


    const match =
      trimmed.match(
        /^(\S+)\s+([A-Za-z]{3}-\d{2}-\d{4})\s+(\d{2}:\d{2}:\d{2})\s+([\s\S]*)$/
      );


    if (!match) {

      return null;

    }


    const level =
      match[1];


    const timestamp =
      `${match[2]} ${match[3]}`;


    const message =
      match[4].trim();


    return {

      id,

      level:
        level.toUpperCase(),

      service: '',

      message,

      status:
        this.getStatusFromLevel(
          level
        ),

      timestamp

    };

  }


  /* =========================================================
     JSON LOGS
  ========================================================= */

  private convertJsonToLogs(
    response: unknown
  ): ServerLog[] {

    let records: unknown[] = [];


    if (
      Array.isArray(response)
    ) {

      records = response;

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
        Array.isArray(data['logs'])
      ) {

        records =
          data['logs'];

      }

      else if (
        Array.isArray(data['data'])
      ) {

        records =
          data['data'];

      }

      else if (
        Array.isArray(data['items'])
      ) {

        records =
          data['items'];

      }

      else if (
        Array.isArray(data['records'])
      ) {

        records =
          data['records'];

      }

    }


    return records
      .map(
        (
          item: unknown,
          index: number
        ) =>
          this.convertSingleJsonLog(
            item,
            index + 1
          )
      )
      .filter(
        (
          log
        ): log is ServerLog =>
          log !== null
      );

  }


  /* =========================================================
     ONE JSON LOG
  ========================================================= */

  private convertSingleJsonLog(
    item: unknown,
    id: number
  ): ServerLog | null {

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


    const level =
      this.getValue(
        record,
        [
          'level',
          'type',
          'logType',
          'log_type',
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


    const service =
      this.getValue(
        record,
        [
          'service',
          'serviceName',
          'service_name'
        ]
      );


    const timestamp =
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
      !level &&
      !message &&
      !timestamp
    ) {

      return null;

    }


    return {

      id,

      level:
        (
          level ||
          'INFO'
        ).toUpperCase(),

      service,

      message,

      status:
        this.getStatusFromLevel(
          level
        ),

      timestamp

    };

  }


  /* =========================================================
     GET VALUE
  ========================================================= */

  private getValue(
    record: Record<string, unknown>,
    keys: string[]
  ): string {

    for (
      const key of keys
    ) {

      const value =
        record[key];


      if (
        value !== null &&
        value !== undefined
      ) {

        const text =
          String(value).trim();


        if (text) {

          return text;

        }

      }

    }


    return '';

  }


  /* =========================================================
     STATUS
  ========================================================= */

  private getStatusFromLevel(
    level: string
  ): string {

    const value =
      (
        level ?? ''
      )
        .trim()
        .toLowerCase();


    if (
      value === 'warn' ||
      value === 'warning'
    ) {

      return 'Warning';

    }


    if (
      value === 'error' ||
      value === 'err'
    ) {

      return 'Failed';

    }


    if (
      value === 'info'
    ) {

      return 'Success';

    }


    return '';

  }


  /* =========================================================
     CLEAN TEXT
  ========================================================= */

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

}