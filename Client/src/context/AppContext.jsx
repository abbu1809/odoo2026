import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setAuthToken, ApiError } from '../api/client';
import * as authApi from '../api/auth';
import * as vehiclesApi from '../api/vehicles';
import * as driversApi from '../api/drivers';
import * as tripsApi from '../api/trips';
import * as maintenanceApi from '../api/maintenance';
import * as fuelLogsApi from '../api/fuelLogs';
import * as expensesApi from '../api/expenses';
import * as dashboardApi from '../api/dashboard';
import * as reportsApi from '../api/reports';
import * as usersApi from '../api/users';

const AppContext = createContext();

const TOKEN_KEY = 'transitops_token';

// Roles permitted to perform *write* operations on each resource (spec API.md).
const WRITE_ROLES = {
  vehicles: ['ADMIN', 'FLEET_MANAGER'],
  drivers: ['ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'],
  trips: ['ADMIN', 'FLEET_MANAGER', 'DRIVER'],
  maintenance: ['ADMIN', 'FLEET_MANAGER'],
  fuelLogs: ['ADMIN', 'FLEET_MANAGER', 'DRIVER'],
  expenses: ['ADMIN', 'FLEET_MANAGER', 'DRIVER'],
  users: ['ADMIN'],
};

// Only ADMIN may delete these (spec API.md); other writable resources use the
// same roles for delete as for write.
const ADMIN_ONLY_DELETE = ['vehicles', 'drivers', 'users'];

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboardKpis, setDashboardKpis] = useState(null);
  const [reportsOverview, setReportsOverview] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const describeError = (err, fallback) =>
    err instanceof ApiError ? err.message : fallback;

  // ----------------------------------------------------
  // SESSION BOOTSTRAP
  // ----------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setInitializing(false);
      return;
    }
    setAuthToken(token);
    authApi
      .getMe()
      .then((me) => setUser(me))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  // ----------------------------------------------------
  // AUTH
  // ----------------------------------------------------
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const { user: u, token } = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
      setUser(u);
      showToast(`Welcome back, ${u.name}.`);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: describeError(err, 'Login failed') };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async ({ name, email, password, role }) => {
    setAuthLoading(true);
    try {
      const { user: u, token } = await authApi.register({ name, email, password, role });
      localStorage.setItem(TOKEN_KEY, token);
      setAuthToken(token);
      setUser(u);
      showToast(`Account created. Welcome, ${u.name}.`);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: describeError(err, 'Registration failed') };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setVehicles([]);
    setDrivers([]);
    setTrips([]);
    setMaintenanceLogs([]);
    setFuelLogs([]);
    setExpenses([]);
    setUsers([]);
    setDashboardKpis(null);
    setReportsOverview(null);
  }, []);

  // ----------------------------------------------------
  // PERMISSIONS
  // ----------------------------------------------------
  const canWrite = useCallback(
    (resource) => !!user && !!WRITE_ROLES[resource]?.includes(user.role),
    [user]
  );

  const canDelete = useCallback(
    (resource) => {
      if (!user) return false;
      if (ADMIN_ONLY_DELETE.includes(resource)) return user.role === 'ADMIN';
      return canWrite(resource);
    },
    [user, canWrite]
  );

  const isAdmin = user?.role === 'ADMIN';

  // ----------------------------------------------------
  // LICENSE HELPERS
  // ----------------------------------------------------
  const checkIsLicenseExpired = (expiryDateString) => {
    if (!expiryDateString) return false;
    return new Date(expiryDateString) < new Date();
  };

  const checkIsLicenseExpiringSoon = (expiryDateString) => {
    if (!expiryDateString) return false;
    const diffDays = Math.ceil((new Date(expiryDateString) - new Date()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  // ----------------------------------------------------
  // REFRESH (list) HELPERS
  // ----------------------------------------------------
  const refreshVehicles = useCallback(async (params = {}) => {
    try {
      const res = await vehiclesApi.listVehicles({ pageSize: 100, ...params });
      setVehicles(res.data);
      return res.data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load vehicles'), 'error');
      return [];
    }
  }, [showToast]);

  const refreshDrivers = useCallback(async (params = {}) => {
    try {
      const res = await driversApi.listDrivers({ pageSize: 100, ...params });
      setDrivers(res.data);
      return res.data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load drivers'), 'error');
      return [];
    }
  }, [showToast]);

  const refreshTrips = useCallback(async (params = {}) => {
    try {
      const res = await tripsApi.listTrips({ pageSize: 100, ...params });
      setTrips(res.data);
      return res.data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load trips'), 'error');
      return [];
    }
  }, [showToast]);

  const refreshMaintenance = useCallback(async (params = {}) => {
    try {
      const res = await maintenanceApi.listMaintenance({ pageSize: 100, ...params });
      setMaintenanceLogs(res.data);
      return res.data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load maintenance records'), 'error');
      return [];
    }
  }, [showToast]);

  const refreshFuelLogs = useCallback(async (params = {}) => {
    try {
      const res = await fuelLogsApi.listFuelLogs({ pageSize: 100, ...params });
      setFuelLogs(res.data);
      return res.data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load fuel logs'), 'error');
      return [];
    }
  }, [showToast]);

  const refreshExpenses = useCallback(async (params = {}) => {
    try {
      const res = await expensesApi.listExpenses({ pageSize: 100, ...params });
      setExpenses(res.data);
      return res.data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load expenses'), 'error');
      return [];
    }
  }, [showToast]);

  const refreshDashboard = useCallback(async (params = {}) => {
    try {
      const data = await dashboardApi.getDashboardKpis(params);
      setDashboardKpis(data);
      return data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load dashboard KPIs'), 'error');
      return null;
    }
  }, [showToast]);

  const refreshReports = useCallback(async (params = {}) => {
    try {
      const data = await reportsApi.getReportsOverview(params);
      setReportsOverview(data);
      return data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load reports'), 'error');
      return null;
    }
  }, [showToast]);

  const refreshUsers = useCallback(async (params = {}) => {
    if (!isAdmin) return [];
    try {
      const res = await usersApi.listUsers({ pageSize: 100, ...params });
      setUsers(res.data);
      return res.data;
    } catch (err) {
      showToast(describeError(err, 'Failed to load users'), 'error');
      return [];
    }
  }, [showToast, isAdmin]);

  // Load everything once we have an authenticated user.
  useEffect(() => {
    if (!user) return;
    refreshVehicles();
    refreshDrivers();
    refreshTrips();
    refreshMaintenance();
    refreshFuelLogs();
    refreshExpenses();
    refreshDashboard();
    if (user.role === 'ADMIN') refreshUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ----------------------------------------------------
  // VEHICLE CRUD
  // ----------------------------------------------------
  const addVehicle = async (vehicle) => {
    try {
      const created = await vehiclesApi.createVehicle({
        registrationNumber: vehicle.registrationNumber,
        name: vehicle.name,
        type: vehicle.type,
        maxLoadCapacityKg: Number(vehicle.maxLoadCapacityKg),
        acquisitionCost: Number(vehicle.acquisitionCost),
        region: vehicle.region || undefined,
      });
      setVehicles((prev) => [created, ...prev]);
      showToast(`Vehicle ${created.registrationNumber} successfully registered.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to register vehicle'), 'error');
      return false;
    }
  };

  const updateVehicle = async (id, updates) => {
    try {
      const updated = await vehiclesApi.updateVehicle(id, updates);
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
      showToast(`Vehicle ${updated.registrationNumber} updated successfully.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to update vehicle'), 'error');
      return false;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await vehiclesApi.deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      showToast('Vehicle removed from registry.');
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to delete vehicle'), 'error');
      return false;
    }
  };

  // ----------------------------------------------------
  // DRIVER CRUD
  // ----------------------------------------------------
  const addDriver = async (driver) => {
    try {
      const created = await driversApi.createDriver({
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        licenseCategory: driver.licenseCategory,
        licenseExpiryDate: driver.licenseExpiryDate,
        contactNumber: driver.contactNumber,
      });
      setDrivers((prev) => [created, ...prev]);
      showToast(`Driver ${created.name} added to roster.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to register driver'), 'error');
      return false;
    }
  };

  const updateDriver = async (id, updates) => {
    try {
      const updated = await driversApi.updateDriver(id, updates);
      setDrivers((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast(`Driver ${updated.name} profile updated.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to update driver'), 'error');
      return false;
    }
  };

  const deleteDriver = async (id) => {
    try {
      await driversApi.deleteDriver(id);
      setDrivers((prev) => prev.filter((d) => d.id !== id));
      showToast('Driver removed from roster.');
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to delete driver'), 'error');
      return false;
    }
  };

  // ----------------------------------------------------
  // TRIP WORKFLOWS
  // ----------------------------------------------------
  const createTrip = async (tripData) => {
    try {
      const created = await tripsApi.createTrip({
        source: tripData.source,
        destination: tripData.destination,
        vehicleId: tripData.vehicleId,
        driverId: tripData.driverId,
        cargoWeightKg: Number(tripData.cargoWeightKg),
        plannedDistanceKm: tripData.plannedDistanceKm ? Number(tripData.plannedDistanceKm) : undefined,
      });
      setTrips((prev) => [created, ...prev]);
      showToast(`Trip to ${created.destination} created in Draft.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to create trip'), 'error');
      return false;
    }
  };

  const dispatchTrip = async (tripId) => {
    try {
      const updated = await tripsApi.dispatchTrip(tripId);
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
      await Promise.all([refreshVehicles(), refreshDrivers()]);
      showToast(`Trip dispatched. Vehicle and driver are now On Trip.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to dispatch trip'), 'error');
      return false;
    }
  };

  const completeTrip = async (tripId, completeData) => {
    try {
      const updated = await tripsApi.completeTrip(tripId, {
        finalOdometerKm: Number(completeData.finalOdometerKm),
        fuelConsumedLtr: completeData.fuelConsumedLtr ? Number(completeData.fuelConsumedLtr) : undefined,
        revenue: completeData.revenue ? Number(completeData.revenue) : undefined,
      });
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
      await Promise.all([refreshVehicles(), refreshDrivers(), refreshFuelLogs(), refreshExpenses()]);
      showToast(`Trip marked Completed. Fleet assets returned to Available.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to complete trip'), 'error');
      return false;
    }
  };

  const cancelTrip = async (tripId) => {
    try {
      const updated = await tripsApi.cancelTrip(tripId);
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
      await Promise.all([refreshVehicles(), refreshDrivers()]);
      showToast(`Trip cancelled.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to cancel trip'), 'error');
      return false;
    }
  };

  // ----------------------------------------------------
  // MAINTENANCE
  // ----------------------------------------------------
  const addMaintenanceLog = async (logData) => {
    try {
      const created = await maintenanceApi.createMaintenance({
        vehicleId: logData.vehicleId,
        type: logData.type,
        description: logData.description || undefined,
        cost: Number(logData.cost),
      });
      setMaintenanceLogs((prev) => [created, ...prev]);
      await refreshVehicles();
      showToast(`Vehicle moved to 'In Shop' status.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to log maintenance'), 'error');
      return false;
    }
  };

  const completeMaintenanceLog = async (logId) => {
    try {
      const updated = await maintenanceApi.closeMaintenance(logId);
      setMaintenanceLogs((prev) => prev.map((l) => (l.id === logId ? updated : l)));
      await Promise.all([refreshVehicles(), refreshExpenses()]);
      showToast(`Maintenance resolved. Vehicle returned to Available.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to close maintenance record'), 'error');
      return false;
    }
  };

  // ----------------------------------------------------
  // FUEL & EXPENSES
  // ----------------------------------------------------
  const addFuelLog = async (logData) => {
    try {
      const created = await fuelLogsApi.createFuelLog({
        vehicleId: logData.vehicleId,
        tripId: logData.tripId || undefined,
        liters: Number(logData.liters),
        cost: Number(logData.cost),
      });
      setFuelLogs((prev) => [created, ...prev]);
      showToast(`Fuel entry registered.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to log fuel'), 'error');
      return false;
    }
  };

  const deleteFuelLog = async (id) => {
    try {
      await fuelLogsApi.deleteFuelLog(id);
      setFuelLogs((prev) => prev.filter((f) => f.id !== id));
      showToast('Fuel log deleted.');
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to delete fuel log'), 'error');
      return false;
    }
  };

  const addGeneralExpense = async (expenseData) => {
    try {
      const created = await expensesApi.createExpense({
        vehicleId: expenseData.vehicleId,
        category: expenseData.category,
        amount: Number(expenseData.amount),
        description: expenseData.description || undefined,
      });
      setExpenses((prev) => [created, ...prev]);
      showToast(`Expense logged: ${created.amount} (${created.category})`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to log expense'), 'error');
      return false;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expensesApi.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast('Expense deleted.');
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to delete expense'), 'error');
      return false;
    }
  };

  // ----------------------------------------------------
  // ADMIN: USERS
  // ----------------------------------------------------
  const updateUserRecord = async (id, updates) => {
    try {
      const updated = await usersApi.updateUser(id, updates);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      showToast(`User ${updated.name} updated.`);
      return true;
    } catch (err) {
      showToast(describeError(err, 'Failed to update user'), 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        // auth
        user,
        isAuthenticated: !!user,
        initializing,
        authLoading,
        login,
        register,
        logout,
        isAdmin,
        canWrite,
        canDelete,

        // data
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        fuelLogs,
        expenses,
        users,
        dashboardKpis,
        reportsOverview,
        notifications,

        // refresh
        refreshVehicles,
        refreshDrivers,
        refreshTrips,
        refreshMaintenance,
        refreshFuelLogs,
        refreshExpenses,
        refreshDashboard,
        refreshReports,
        refreshUsers,

        // helpers
        checkIsLicenseExpired,
        checkIsLicenseExpiringSoon,
        showToast,

        // vehicle CRUD
        addVehicle,
        updateVehicle,
        deleteVehicle,

        // driver CRUD
        addDriver,
        updateDriver,
        deleteDriver,

        // trip workflow
        createTrip,
        dispatchTrip,
        completeTrip,
        cancelTrip,

        // maintenance
        addMaintenanceLog,
        completeMaintenanceLog,

        // fuel & expenses
        addFuelLog,
        deleteFuelLog,
        addGeneralExpense,
        deleteExpense,

        // admin
        updateUserRecord,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
