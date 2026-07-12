# TransitOps — Database Schema

PostgreSQL, modeled with Prisma. Source of truth: [`prisma/schema.prisma`](./prisma/schema.prisma).
IDs are `cuid()` strings on every table. All models have `createdAt`
(`FuelLog`/`Expense`) and `createdAt` + `updatedAt` (all others).

## Entity-relationship overview

```
User ──< Driver (optional 1:1, User.role = DRIVER)
User ──< Trip            (createdBy)
User ──< MaintenanceLog  (createdBy)
User ──< FuelLog         (loggedBy)
User ──< Expense         (loggedBy)

Vehicle ──< Trip
Vehicle ──< MaintenanceLog
Vehicle ──< FuelLog
Vehicle ──< Expense

Driver ──< Trip

Trip ──< FuelLog   (optional: a fuel log can reference the trip it was bought for)
```

## Enums

| Enum | Values | Used by |
|---|---|---|
| `UserRole` | `ADMIN`, `FLEET_MANAGER`, `DRIVER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST` | `User.role` |
| `VehicleType` | `TRUCK`, `VAN`, `BUS`, `CAR`, `MOTORCYCLE`, `TRAILER`, `OTHER` | `Vehicle.type` |
| `VehicleStatus` | `AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED` | `Vehicle.status` |
| `DriverStatus` | `AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED` | `Driver.status` |
| `TripStatus` | `DRAFT`, `DISPATCHED`, `COMPLETED`, `CANCELLED` | `Trip.status` |
| `MaintenanceStatus` | `OPEN`, `CLOSED` | `MaintenanceLog.status` |
| `ExpenseCategory` | `TOLL`, `PARKING`, `FINE`, `PERMIT`, `INSURANCE`, `OTHER` | `Expense.category` |

## Tables

### `users`

Login accounts. Role drives RBAC.

| Column | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `name` | string | |
| `email` | string | **unique** |
| `passwordHash` | string | bcrypt hash, never returned by the API |
| `role` | `UserRole` | |
| `isActive` | boolean | default `true`; deactivated users can't log in |
| `createdAt` / `updatedAt` | datetime | |

### `vehicles`

Master vehicle registry (spec §3.3).

| Column | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `registrationNumber` | string | **unique** |
| `name` | string | model/name |
| `type` | `VehicleType` | |
| `maxLoadCapacityKg` | float | cargo cap; enforced against `Trip.cargoWeightKg` |
| `odometerKm` | float | default `0`; advanced on trip completion |
| `acquisitionCost` | decimal(12,2) | used in ROI denominator |
| `status` | `VehicleStatus` | default `AVAILABLE`; auto-managed by trip/maintenance flows |
| `region` | string? | optional; used for dashboard/report filters |
| `createdAt` / `updatedAt` | datetime | |

Indexes: `status`, `type`, `region`.

### `drivers`

Driver profiles — the person operating a vehicle (spec §3.4). See
`context.md` §5 for how this differs from the `DRIVER` **user role**.

| Column | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `name` | string | |
| `licenseNumber` | string | **unique** |
| `licenseCategory` | string | free text (e.g. "LMV", "HMV") |
| `licenseExpiryDate` | datetime | trips are blocked once this is in the past |
| `contactNumber` | string | |
| `safetyScore` | float | default `100` |
| `status` | `DriverStatus` | default `AVAILABLE`; auto-managed by trip flow |
| `userId` | string? | **unique**, FK → `users.id`, nullable; optional login link |
| `createdAt` / `updatedAt` | datetime | |

Indexes: `status`.

### `trips`

Trip lifecycle: `DRAFT → DISPATCHED → COMPLETED` or `→ CANCELLED` (spec §3.5).

| Column | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `source` / `destination` | string | |
| `status` | `TripStatus` | default `DRAFT` |
| `vehicleId` | string | FK → `vehicles.id`, `onDelete: Restrict` |
| `driverId` | string | FK → `drivers.id`, `onDelete: Restrict` |
| `cargoWeightKg` | float | validated ≤ `vehicle.maxLoadCapacityKg` |
| `plannedDistanceKm` | float | |
| `startOdometerKm` | float? | snapshot of `vehicle.odometerKm` at dispatch |
| `finalOdometerKm` | float? | entered on completion |
| `fuelConsumedLtr` | float? | entered on completion |
| `actualDistanceKm` | float? | derived: `finalOdometerKm - startOdometerKm` |
| `revenue` | decimal(12,2)? | optional; feeds the ROI report |
| `dispatchedAt` / `completedAt` / `cancelledAt` | datetime? | lifecycle timestamps |
| `createdById` | string | FK → `users.id`, `onDelete: Restrict` |
| `createdAt` / `updatedAt` | datetime | |

Indexes: `status`, `vehicleId`, `driverId`.

### `maintenance_logs`

Maintenance workflow (spec §3.6). Opening a record (`status = OPEN`) forces
`vehicle.status = IN_SHOP`; closing it (`status = CLOSED`) restores
`AVAILABLE` unless the vehicle is `RETIRED` or another `OPEN` record remains.

| Column | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `vehicleId` | string | FK → `vehicles.id`, `onDelete: Cascade` |
| `type` | string | e.g. "Oil Change" |
| `description` | string? | |
| `cost` | decimal(12,2) | default `0`; feeds Operational Cost |
| `status` | `MaintenanceStatus` | default `OPEN` |
| `startDate` | datetime | default `now()` |
| `endDate` | datetime? | set on close |
| `createdById` | string | FK → `users.id`, `onDelete: Restrict` |
| `createdAt` / `updatedAt` | datetime | |

Indexes: `vehicleId`, `status`.

### `fuel_logs`

Fuel fill-ups (spec §3.7): liters, cost, date.

| Column | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `vehicleId` | string | FK → `vehicles.id`, `onDelete: Cascade` |
| `tripId` | string? | FK → `trips.id`, `onDelete: SetNull`; optional link |
| `liters` | float | |
| `cost` | decimal(12,2) | feeds Operational Cost |
| `date` | datetime | default `now()` |
| `loggedById` | string | FK → `users.id`, `onDelete: Restrict` |
| `createdAt` | datetime | |

Indexes: `vehicleId`, `date`.

### `expenses`

Miscellaneous operational expenses — tolls, fines, permits, etc. (spec §3.7).
**Not** included in the Fuel + Maintenance "Operational Cost" formula (see
below); tracked separately for full cost visibility and CSV export.

| Column | Type | Notes |
|---|---|---|
| `id` | string (cuid) | PK |
| `vehicleId` | string? | FK → `vehicles.id`, `onDelete: SetNull`; nullable for fleet-wide expenses |
| `category` | `ExpenseCategory` | |
| `amount` | decimal(12,2) | |
| `date` | datetime | default `now()` |
| `description` | string? | |
| `loggedById` | string | FK → `users.id`, `onDelete: Restrict` |
| `createdAt` | datetime | |

Indexes: `vehicleId`, `category`.

## Derived metrics (not stored columns — computed in `modules/reports`)

Per vehicle, over `COMPLETED` trips / all fuel logs / all maintenance logs:

- **Fuel Efficiency** = `Σ Trip.actualDistanceKm / Σ FuelLog.liters` (km/L)
- **Operational Cost** = `Σ FuelLog.cost + Σ MaintenanceLog.cost`
- **Vehicle ROI** = `(Σ Trip.revenue − Operational Cost) / Vehicle.acquisitionCost`
- **Fleet Utilization %** = `count(Vehicle where status = ON_TRIP) / count(Vehicle where status != RETIRED) × 100`

See `API.md` → `GET /reports/overview` and `GET /dashboard/kpis` for the
exact endpoints and response shapes.

## Migrations

```bash
npm run prisma:migrate   # prisma migrate dev — creates/updates tables from schema.prisma
npm run prisma:studio    # visual DB browser
npm run prisma:generate  # regenerate the client after editing schema.prisma
```