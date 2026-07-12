import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const initialVehicles = [
  { registrationNumber: 'Van-05', name: 'Ford Transit Van-05', type: 'Van', maxCapacity: 500, odometer: 25000, acquisitionCost: 32000, status: 'Available', region: 'North' },
  { registrationNumber: 'Truck-01', name: 'Volvo FH16 Heavy Truck', type: 'Truck', maxCapacity: 5000, odometer: 124000, acquisitionCost: 95000, status: 'In Shop', region: 'East' },
  { registrationNumber: 'Semi-03', name: 'Peterbilt 389 Semi', type: 'Semi', maxCapacity: 15000, odometer: 420000, acquisitionCost: 150000, status: 'Retired', region: 'West' },
  { registrationNumber: 'Sedan-02', name: 'Toyota Camry Support', type: 'Sedan', maxCapacity: 350, odometer: 68000, acquisitionCost: 24000, status: 'On Trip', region: 'South' },
  { registrationNumber: 'Van-08', name: 'Mercedes Sprinter Van-08', type: 'Van', maxCapacity: 800, odometer: 45000, acquisitionCost: 42000, status: 'Available', region: 'North' }
];

const initialDrivers = [
  { name: 'Alex', licenseNumber: 'DL-A73981', licenseCategory: 'Class B', licenseExpiryDate: '2028-09-12', contactNumber: '+1-555-0101', safetyScore: 96, status: 'Available' },
  { name: 'Marcus', licenseNumber: 'DL-M88491', licenseCategory: 'Class A', licenseExpiryDate: '2026-08-05', contactNumber: '+1-555-0122', safetyScore: 82, status: 'On Trip' },
  { name: 'Elena', licenseNumber: 'DL-E22394', licenseCategory: 'Class A', licenseExpiryDate: '2026-05-10', contactNumber: '+1-555-0145', safetyScore: 99, status: 'Available' }, // Expired license
  { name: 'Devon', licenseNumber: 'DL-D99021', licenseCategory: 'Class C', licenseExpiryDate: '2027-02-14', contactNumber: '+1-555-0188', safetyScore: 65, status: 'Suspended' },
  { name: 'Sarah', licenseNumber: 'DL-S10023', licenseCategory: 'Class B', licenseExpiryDate: '2028-11-20', contactNumber: '+1-555-0177', safetyScore: 92, status: 'Off Duty' }
];

const initialTrips = [
  {
    id: 'trip-101',
    source: 'Warehouse A (Chicago)',
    destination: 'Distribution Center (Detroit)',
    vehicleId: 'Sedan-02',
    driverName: 'Marcus',
    cargoWeight: 150,
    distance: 450,
    revenue: 1200,
    status: 'Dispatched',
    date: '2026-07-11',
    finalOdometer: null,
    finalFuelConsumed: null
  },
  {
    id: 'trip-100',
    source: 'Logistics Hub (Indianapolis)',
    destination: 'Retail Depot (Columbus)',
    vehicleId: 'Van-08',
    driverName: 'Alex',
    cargoWeight: 600,
    distance: 280,
    revenue: 950,
    status: 'Completed',
    date: '2026-07-10',
    finalOdometer: 45000,
    finalFuelConsumed: 32
  }
];

const initialMaintenanceLogs = [
  {
    id: 'maint-201',
    vehicleId: 'Truck-01',
    type: 'Brake Replacement',
    cost: 1200,
    date: '2026-07-11',
    description: 'Replaced front and rear brake pads and rotors.',
    status: 'Active'
  },
  {
    id: 'maint-200',
    vehicleId: 'Van-08',
    type: 'Oil Change',
    cost: 150,
    date: '2026-07-09',
    description: 'Regular engine oil and filter replacement.',
    status: 'Completed'
  }
];

const initialFuelLogs = [
  { id: 'fuel-301', vehicleId: 'Van-08', liters: 32, cost: 64, date: '2026-07-10', odometer: 45000 },
  { id: 'fuel-300', vehicleId: 'Truck-01', liters: 120, cost: 240, date: '2026-07-05', odometer: 123800 }
];

const initialExpenses = [
  { id: 'exp-401', vehicleId: 'Van-08', type: 'Toll', cost: 35, date: '2026-07-10', description: 'I-90 Turnpike Tolls' },
  { id: 'exp-400', vehicleId: 'Truck-01', type: 'Maintenance', cost: 1200, date: '2026-07-11', description: 'Brake Replacement' },
  { id: 'exp-399', vehicleId: 'Van-08', type: 'Maintenance', cost: 150, date: '2026-07-09', description: 'Oil Change' },
  { id: 'exp-398', vehicleId: 'Van-08', type: 'Fuel', cost: 64, date: '2026-07-10', description: 'Refuel log (32L)' },
  { id: 'exp-397', vehicleId: 'Truck-01', type: 'Fuel', cost: 240, date: '2026-07-05', description: 'Refuel log (120L)' }
];

export const AppProvider = ({ children }) => {
  const [activeUserRole, setActiveUserRole] = useState(() => {
    return localStorage.getItem('transitops_role') || 'Fleet Manager';
  });

  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('transitops_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem('transitops_drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('transitops_trips');
    return saved ? JSON.parse(saved) : initialTrips;
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState(() => {
    const saved = localStorage.getItem('transitops_maintenance');
    return saved ? JSON.parse(saved) : initialMaintenanceLogs;
  });

  const [fuelLogs, setFuelLogs] = useState(() => {
    const saved = localStorage.getItem('transitops_fuel');
    return saved ? JSON.parse(saved) : initialFuelLogs;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('transitops_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [notifications, setNotifications] = useState([]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('transitops_role', activeUserRole);
  }, [activeUserRole]);

  useEffect(() => {
    localStorage.setItem('transitops_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transitops_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('transitops_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('transitops_maintenance', JSON.stringify(maintenanceLogs));
  }, [maintenanceLogs]);

  useEffect(() => {
    localStorage.setItem('transitops_fuel', JSON.stringify(fuelLogs));
  }, [fuelLogs]);

  useEffect(() => {
    localStorage.setItem('transitops_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Toast System Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  // Helper: check if license is expired based on current local date: 2026-07-12
  const checkIsLicenseExpired = (expiryDateString) => {
    const today = new Date('2026-07-12');
    const expiry = new Date(expiryDateString);
    return expiry < today;
  };

  // Helper: check if license is expiring within 30 days
  const checkIsLicenseExpiringSoon = (expiryDateString) => {
    const today = new Date('2026-07-12');
    const expiry = new Date(expiryDateString);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  };

  // ----------------------------------------------------
  // VEHICLE CRUD
  // ----------------------------------------------------
  const addVehicle = (vehicle) => {
    const exists = vehicles.some(
      (v) => v.registrationNumber.toLowerCase().trim() === vehicle.registrationNumber.toLowerCase().trim()
    );
    if (exists) {
      showToast(`Vehicle Registration '${vehicle.registrationNumber}' already exists!`, 'error');
      return false;
    }
    const newVehicle = {
      ...vehicle,
      odometer: Number(vehicle.odometer) || 0,
      maxCapacity: Number(vehicle.maxCapacity) || 0,
      acquisitionCost: Number(vehicle.acquisitionCost) || 0,
      status: vehicle.status || 'Available',
      region: vehicle.region || 'North'
    };
    setVehicles((prev) => [...prev, newVehicle]);
    showToast(`Vehicle ${newVehicle.registrationNumber} successfully registered.`);
    return true;
  };

  const updateVehicle = (regNum, updatedDetails) => {
    setVehicles((prev) =>
      prev.map((v) => (v.registrationNumber === regNum ? { ...v, ...updatedDetails } : v))
    );
    showToast(`Vehicle ${regNum} updated successfully.`);
    return true;
  };

  const deleteVehicle = (regNum) => {
    setVehicles((prev) => prev.filter((v) => v.registrationNumber !== regNum));
    showToast(`Vehicle ${regNum} removed from registry.`);
    return true;
  };

  // ----------------------------------------------------
  // DRIVER CRUD
  // ----------------------------------------------------
  const addDriver = (driver) => {
    const exists = drivers.some(
      (d) => d.name.toLowerCase().trim() === driver.name.toLowerCase().trim()
    );
    if (exists) {
      showToast(`Driver name '${driver.name}' is already taken!`, 'error');
      return false;
    }
    const newDriver = {
      ...driver,
      safetyScore: Number(driver.safetyScore) || 100,
      status: driver.status || 'Available'
    };
    setDrivers((prev) => [...prev, newDriver]);
    showToast(`Driver ${newDriver.name} added to roster.`);
    return true;
  };

  const updateDriver = (name, updatedDetails) => {
    setDrivers((prev) => prev.map((d) => (d.name === name ? { ...d, ...updatedDetails } : d)));
    showToast(`Driver ${name} profile updated.`);
    return true;
  };

  const deleteDriver = (name) => {
    setDrivers((prev) => prev.filter((d) => d.name !== name));
    showToast(`Driver ${name} removed from roster.`);
    return true;
  };

  // ----------------------------------------------------
  // TRIP WORKFLOWS & VALIDATIONS
  // ----------------------------------------------------
  const createTrip = (tripData) => {
    const vehicle = vehicles.find((v) => v.registrationNumber === tripData.vehicleId);
    const driver = drivers.find((d) => d.name === tripData.driverName);

    // Business rule checks
    if (!vehicle) {
      showToast('Select a valid vehicle.', 'error');
      return false;
    }
    if (!driver) {
      showToast('Select a valid driver.', 'error');
      return false;
    }

    // Vehicle Status Lock: In Shop, Retired, On Trip cannot be selected
    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') {
      showToast(`Vehicle ${vehicle.registrationNumber} is ${vehicle.status} and cannot be dispatched.`, 'error');
      return false;
    }
    if (vehicle.status === 'On Trip') {
      showToast(`Vehicle ${vehicle.registrationNumber} is already on another active trip.`, 'error');
      return false;
    }

    // Driver Status Lock: Suspended, Off Duty, On Trip, Expired license cannot be assigned
    if (driver.status === 'Suspended') {
      showToast(`Driver ${driver.name} is currently Suspended and cannot be assigned.`, 'error');
      return false;
    }
    if (driver.status === 'Off Duty') {
      showToast(`Driver ${driver.name} is Off Duty and cannot be assigned.`, 'error');
      return false;
    }
    if (driver.status === 'On Trip') {
      showToast(`Driver ${driver.name} is already assigned to an active trip.`, 'error');
      return false;
    }
    if (checkIsLicenseExpired(driver.licenseExpiryDate)) {
      showToast(`Driver ${driver.name} has an expired driving license (Expired on ${driver.licenseExpiryDate})!`, 'error');
      return false;
    }

    // Cargo capacity check
    if (Number(tripData.cargoWeight) > vehicle.maxCapacity) {
      showToast(`Cargo weight (${tripData.cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxCapacity} kg)!`, 'error');
      return false;
    }

    const newTrip = {
      id: `trip-${Date.now()}`,
      source: tripData.source,
      destination: tripData.destination,
      vehicleId: tripData.vehicleId,
      driverName: tripData.driverName,
      cargoWeight: Number(tripData.cargoWeight),
      distance: Number(tripData.distance),
      revenue: Number(tripData.revenue) || 0,
      status: 'Draft',
      date: tripData.date || '2026-07-12',
      finalOdometer: null,
      finalFuelConsumed: null
    };

    setTrips((prev) => [newTrip, ...prev]);
    showToast(`Trip to ${tripData.destination} created in Draft.`);
    return true;
  };

  const dispatchTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return false;

    // Check again if vehicle or driver got locked in the meantime
    const vehicle = vehicles.find((v) => v.registrationNumber === trip.vehicleId);
    const driver = drivers.find((d) => d.name === trip.driverName);

    if (vehicle.status !== 'Available') {
      showToast(`Cannot dispatch: Vehicle ${vehicle.registrationNumber} is ${vehicle.status}.`, 'error');
      return false;
    }
    if (driver.status !== 'Available') {
      showToast(`Cannot dispatch: Driver ${driver.name} is ${driver.status}.`, 'error');
      return false;
    }

    // Mark as On Trip
    setVehicles((prev) =>
      prev.map((v) => (v.registrationNumber === vehicle.registrationNumber ? { ...v, status: 'On Trip' } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.name === driver.name ? { ...d, status: 'On Trip' } : d))
    );
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'Dispatched' } : t))
    );

    showToast(`Trip ${tripId} Dispatched! Vehicle and Driver are now On Trip.`);
    return true;
  };

  const completeTrip = (tripId, completeData) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return false;

    const { finalOdometer, fuelConsumed, fuelCost, revenueValue } = completeData;
    const currentVehicle = vehicles.find((v) => v.registrationNumber === trip.vehicleId);

    if (Number(finalOdometer) < currentVehicle.odometer) {
      showToast(`Final odometer (${finalOdometer} km) cannot be less than starting odometer (${currentVehicle.odometer} km).`, 'error');
      return false;
    }

    // Update vehicle odometer and return both to Available
    setVehicles((prev) =>
      prev.map((v) =>
        v.registrationNumber === trip.vehicleId
          ? { ...v, odometer: Number(finalOdometer), status: 'Available' }
          : v
      )
    );

    setDrivers((prev) =>
      prev.map((d) => (d.name === trip.driverName ? { ...d, status: 'Available' } : d))
    );

    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: 'Completed',
              finalOdometer: Number(finalOdometer),
              finalFuelConsumed: Number(fuelConsumed),
              revenue: Number(revenueValue) || t.revenue
            }
          : t
      )
    );

    const logIdSuffix = Date.now();

    // Register Fuel Log if fuel was consumed
    if (Number(fuelConsumed) > 0) {
      const fuelLog = {
        id: `fuel-${logIdSuffix}`,
        vehicleId: trip.vehicleId,
        liters: Number(fuelConsumed),
        cost: Number(fuelCost) || 0,
        date: '2026-07-12',
        odometer: Number(finalOdometer)
      };
      setFuelLogs((prev) => [fuelLog, ...prev]);

      // Log Expense as Fuel type
      const fuelExpense = {
        id: `exp-${logIdSuffix}-fuel`,
        vehicleId: trip.vehicleId,
        type: 'Fuel',
        cost: Number(fuelCost) || 0,
        date: '2026-07-12',
        description: `Refuel log (${fuelConsumed}L) for completed trip`
      };
      setExpenses((prev) => [fuelExpense, ...prev]);
    }

    showToast(`Trip ${tripId} marked Completed. Fleet assets returned to Available.`);
    return true;
  };

  const cancelTrip = (tripId) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return false;

    // Restore vehicle and driver to Available if it was active
    if (trip.status === 'Dispatched') {
      setVehicles((prev) =>
        prev.map((v) => (v.registrationNumber === trip.vehicleId ? { ...v, status: 'Available' } : v))
      );
      setDrivers((prev) =>
        prev.map((d) => (d.name === trip.driverName ? { ...d, status: 'Available' } : d))
      );
    }

    setTrips((prev) => prev.map((t) => (t.id === tripId ? { ...t, status: 'Cancelled' } : t)));
    showToast(`Trip ${tripId} Cancelled.`);
    return true;
  };

  // ----------------------------------------------------
  // MAINTENANCE LOGS
  // ----------------------------------------------------
  const addMaintenanceLog = (logData) => {
    const vehicle = vehicles.find((v) => v.registrationNumber === logData.vehicleId);
    if (!vehicle) return false;

    if (vehicle.status === 'Retired') {
      showToast('Cannot put a Retired vehicle into maintenance.', 'error');
      return false;
    }

    const logId = `maint-${Date.now()}`;
    const newLog = {
      id: logId,
      vehicleId: logData.vehicleId,
      type: logData.type,
      cost: Number(logData.cost) || 0,
      date: logData.date || '2026-07-12',
      description: logData.description || '',
      status: logData.status || 'Active'
    };

    setMaintenanceLogs((prev) => [newLog, ...prev]);

    // Automatically switch status to In Shop if active
    if (newLog.status === 'Active') {
      setVehicles((prev) =>
        prev.map((v) => (v.registrationNumber === logData.vehicleId ? { ...v, status: 'In Shop' } : v))
      );
      showToast(`Vehicle ${logData.vehicleId} moved to 'In Shop' status.`);
    }

    return true;
  };

  const completeMaintenanceLog = (logId) => {
    const log = maintenanceLogs.find((l) => l.id === logId);
    if (!log) return false;

    // Update log status
    setMaintenanceLogs((prev) =>
      prev.map((l) => (l.id === logId ? { ...l, status: 'Completed' } : l))
    );

    // Create Maintenance Expense entry
    const newExpense = {
      id: `exp-${Date.now()}-maint`,
      vehicleId: log.vehicleId,
      type: 'Maintenance',
      cost: log.cost,
      date: '2026-07-12',
      description: `${log.type} (Completed)`
    };
    setExpenses((prev) => [newExpense, ...prev]);

    // Restore vehicle to Available (unless retired)
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.registrationNumber === log.vehicleId) {
          return { ...v, status: v.status === 'Retired' ? 'Retired' : 'Available' };
        }
        return v;
      })
    );

    showToast(`Maintenance resolved. Vehicle ${log.vehicleId} returned to Available.`);
    return true;
  };

  // ----------------------------------------------------
  // FUEL & EXPENSES
  // ----------------------------------------------------
  const addFuelLog = (logData) => {
    const logId = `fuel-${Date.now()}`;
    const newLog = {
      id: logId,
      vehicleId: logData.vehicleId,
      liters: Number(logData.liters),
      cost: Number(logData.cost),
      date: logData.date || '2026-07-12',
      odometer: Number(logData.odometer) || 0
    };

    setFuelLogs((prev) => [newLog, ...prev]);

    // Add fuel expense
    const newExpense = {
      id: `exp-${Date.now()}-fuel-manual`,
      vehicleId: logData.vehicleId,
      type: 'Fuel',
      cost: Number(logData.cost),
      date: logData.date || '2026-07-12',
      description: `Fuel log: ${logData.liters}L @ Odo ${logData.odometer}`
    };
    setExpenses((prev) => [newExpense, ...prev]);

    showToast(`Manual fuel entry registered for ${logData.vehicleId}.`);
    return true;
  };

  const addGeneralExpense = (expenseData) => {
    const expId = `exp-${Date.now()}-gen`;
    const newExpense = {
      id: expId,
      vehicleId: expenseData.vehicleId,
      type: expenseData.type, // Toll, Permit, Insurance, Other
      cost: Number(expenseData.cost),
      date: expenseData.date || '2026-07-12',
      description: expenseData.description || ''
    };

    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Expense logged: $${newExpense.cost} (${newExpense.type})`);
    return true;
  };

  // ----------------------------------------------------
  // CALCULATIONS / STATISTICS
  // ----------------------------------------------------
  // Total operational cost per vehicle = Fuel costs + Maintenance costs + Other expenses
  const getVehicleOperationalCost = (vehicleId) => {
    return expenses
      .filter((e) => e.vehicleId === vehicleId)
      .reduce((sum, e) => sum + e.cost, 0);
  };

  const getVehicleRevenue = (vehicleId) => {
    return trips
      .filter((t) => t.vehicleId === vehicleId && t.status === 'Completed')
      .reduce((sum, t) => sum + t.revenue, 0);
  };

  const getVehicleDistanceTraveled = (vehicleId) => {
    // Total distance of completed trips
    return trips
      .filter((t) => t.vehicleId === vehicleId && t.status === 'Completed')
      .reduce((sum, t) => sum + t.distance, 0);
  };

  const getVehicleFuelConsumed = (vehicleId) => {
    // Total liters from fuel logs
    return fuelLogs
      .filter((fl) => fl.vehicleId === vehicleId)
      .reduce((sum, fl) => sum + fl.liters, 0);
  };

  // ----------------------------------------------------
  // RESET ALL (FOR DEMO RESET)
  // ----------------------------------------------------
  const resetDatabase = () => {
    setVehicles(initialVehicles);
    setDrivers(initialDrivers);
    setTrips(initialTrips);
    setMaintenanceLogs(initialMaintenanceLogs);
    setFuelLogs(initialFuelLogs);
    setExpenses(initialExpenses);
    showToast('Database reset to initial demo seeds.', 'info');
  };

  const rolePermissions = {
    'Fleet Manager': {
      dashboard: 'None',
      vehicles: 'Full',
      drivers: 'Full',
      trips: 'None',
      maintenance: 'Full',
      expenses: 'None',
      reports: 'Full',
      settings: 'Full'
    },
    'Driver': {
      dashboard: 'Full',
      vehicles: 'View',
      drivers: 'None',
      trips: 'Full',
      maintenance: 'None',
      expenses: 'None',
      reports: 'None',
      settings: 'View'
    },
    'Safety Officer': {
      dashboard: 'None',
      vehicles: 'None',
      drivers: 'Full',
      trips: 'View',
      maintenance: 'None',
      expenses: 'None',
      reports: 'None',
      settings: 'View'
    },
    'Financial Analyst': {
      dashboard: 'None',
      vehicles: 'View',
      drivers: 'None',
      trips: 'None',
      maintenance: 'None',
      expenses: 'Full',
      reports: 'Full',
      settings: 'View'
    }
  };

  const getPermission = (tabKey) => {
    return rolePermissions[activeUserRole]?.[tabKey] || 'None';
  };

  const hasAccess = (tabKey) => {
    return getPermission(tabKey) !== 'None';
  };

  return (
    <AppContext.Provider
      value={{
        activeUserRole,
        setActiveUserRole,
        getPermission,
        hasAccess,
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        fuelLogs,
        expenses,
        notifications,
        checkIsLicenseExpired,
        checkIsLicenseExpiringSoon,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        createTrip,
        dispatchTrip,
        completeTrip,
        cancelTrip,
        addMaintenanceLog,
        completeMaintenanceLog,
        addFuelLog,
        addGeneralExpense,
        getVehicleOperationalCost,
        getVehicleRevenue,
        getVehicleDistanceTraveled,
        getVehicleFuelConsumed,
        resetDatabase,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
