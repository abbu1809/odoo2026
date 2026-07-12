export const VEHICLE_TYPES = ['TRUCK', 'VAN', 'MINI', 'OTHER'];
export const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];
export const DRIVER_STATUSES = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];
export const TRIP_STATUSES = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];
export const EXPENSE_CATEGORIES = ['TOLL', 'PARKING', 'FINE', 'PERMIT', 'INSURANCE', 'OTHER'];
export const ROLES = ['ADMIN', 'FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];
export const REGIONS = ['NORTH', 'EAST', 'SOUTH', 'WEST'];

// 'ON_TRIP' -> 'On Trip'
export const humanize = (value) =>
  String(value || '')
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

// 'ON_TRIP' -> 'on-trip' (matches status-badge-* css classes)
export const slug = (value) => String(value || '').toLowerCase().replace(/_/g, '-');

export const formatMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};
