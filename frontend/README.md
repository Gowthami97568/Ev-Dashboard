# ChargeHub — EV Charging Dashboard

Angular 18 (standalone components) + Tailwind CSS implementation of the
ChargeHub dashboard screen, matching the provided design and wired to the
backend's `chargeman`, `chargetransaction`, `devices_master`, `accountinfo`
etc. tables through a small service layer.

## Project structure

```
src/app/
  app.ts / app.html / app.css / app.config.ts / app.routes.ts
  dashboard/
    dashboard.ts / dashboard.html / dashboard.css / dashboard.spec.ts
    components/
      sidebar/    ChargeHub logo, nav sections, signed-in user
      topbar/     page title, date picker, search, notifications
      stat-card/  reusable KPI card (Active Station, Energy Today, ...)
    models/
      dashboard.model.ts   interfaces for every backend table + view-models
    services/
      api.service.ts        thin HttpClient wrapper (base URL, params)
      dashboard.service.ts  dashboard.summary / hourly energy / status /
                             top-stations / alerts, with mock fallback
```

## Getting started

```bash
npm install
npm start        # ng serve, http://localhost:4200
npm run build     # production build -> dist/ev-ui-dashboard
npm test          # karma/jasmine unit tests
```

## Wiring to the real backend

`DashboardService` calls `GET /api/dashboard/summary`,
`GET /api/chargetransaction/hourly`, `GET /api/devices_master/status-breakdown`,
`GET /api/chargeman/top-by-revenue` and `GET /api/chargeman/alerts` through
`ApiService`. Until those endpoints exist, each call falls back to
representative mock data (see the `mock*` methods in `dashboard.service.ts`)
so the UI keeps rendering. Point `ApiService.baseUrl` at your real API host,
or add an Angular proxy config, once the endpoints are live.

## Styling

All visual styling is Tailwind utility classes (see `tailwind.config.js` for
the `brand` / `ink` color tokens used throughout) — component `.css` files
are intentionally left empty.
