import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

const SALT_ROUNDS = 10;
const SEED_PASSWORD = "Password123!";

async function upsertUser(name: string, email: string, role: string) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role: role as never },
  });
}

async function main() {
  console.log("Seeding TransitOps demo data...");

  // ---------------------------------------------------------------------
  // Users — one per role, all sharing the same demo password.
  // ---------------------------------------------------------------------
  const admin = await upsertUser("Admin User", "admin@transitops.io", "ADMIN");
  const fleetManager = await upsertUser("Priya Shah", "fleet@transitops.io", "FLEET_MANAGER");
  const driverUser = await upsertUser("Alex Rider", "driver@transitops.io", "DRIVER");
  const safetyOfficer = await upsertUser("Sam Okafor", "safety@transitops.io", "SAFETY_OFFICER");
  const financialAnalyst = await upsertUser("Jordan Lee", "finance@transitops.io", "FINANCIAL_ANALYST");

  // ---------------------------------------------------------------------
  // Vehicles
  // ---------------------------------------------------------------------
  const van05 = await prisma.vehicle.upsert({
    where: { registrationNumber: "VAN-05" },
    update: {},
    create: {
      registrationNumber: "VAN-05",
      name: "Ford Transit Van-05",
      type: "VAN",
      maxLoadCapacityKg: 500,
      odometerKm: 0,
      acquisitionCost: 850000,
      status: "AVAILABLE",
      region: "WEST",
    },
  });

  const truck01 = await prisma.vehicle.upsert({
    where: { registrationNumber: "TRUCK-01" },
    update: {},
    create: {
      registrationNumber: "TRUCK-01",
      name: "Volvo FH16 Heavy Truck",
      type: "TRUCK",
      maxLoadCapacityKg: 5000,
      odometerKm: 124000,
      acquisitionCost: 9500000,
      status: "AVAILABLE",
      region: "EAST",
    },
  });

  const bus02 = await prisma.vehicle.upsert({
    where: { registrationNumber: "BUS-02" },
    update: {},
    create: {
      registrationNumber: "BUS-02",
      name: "Tata Starbus Mini",
      type: "MINI",
      maxLoadCapacityKg: 3000,
      odometerKm: 68000,
      acquisitionCost: 4200000,
      status: "IN_SHOP",
      region: "NORTH",
    },
  });

  await prisma.vehicle.upsert({
    where: { registrationNumber: "CAR-03" },
    update: {},
    create: {
      registrationNumber: "CAR-03",
      name: "Toyota Camry Support",
      type: "MINI",
      maxLoadCapacityKg: 350,
      odometerKm: 45000,
      acquisitionCost: 2400000,
      status: "AVAILABLE",
      region: "SOUTH",
    },
  });

  await prisma.vehicle.upsert({
    where: { registrationNumber: "TRAILER-09" },
    update: {},
    create: {
      registrationNumber: "TRAILER-09",
      name: "Peterbilt 389 Semi Truck",
      type: "TRUCK",
      maxLoadCapacityKg: 15000,
      odometerKm: 420000,
      acquisitionCost: 15000000,
      status: "RETIRED",
      region: "WEST",
    },
  });

  // ---------------------------------------------------------------------
  // Drivers
  // ---------------------------------------------------------------------
  const alex = await prisma.driver.upsert({
    where: { licenseNumber: "DL-2024-0091" },
    update: {},
    create: {
      name: "Alex Rider",
      licenseNumber: "DL-2024-0091",
      licenseCategory: "LMV",
      licenseExpiryDate: new Date("2028-05-01"),
      contactNumber: "+1-555-0101",
      safetyScore: 96,
      status: "AVAILABLE",
      userId: driverUser.id,
    },
  });

  await prisma.driver.upsert({
    where: { licenseNumber: "DL-2024-0145" },
    update: {},
    create: {
      name: "Priya Nair",
      licenseNumber: "DL-2024-0145",
      licenseCategory: "HMV",
      licenseExpiryDate: new Date("2027-11-20"),
      contactNumber: "+1-555-0177",
      safetyScore: 92,
      status: "AVAILABLE",
    },
  });

  await prisma.driver.upsert({
    where: { licenseNumber: "DL-2023-0088" },
    update: {},
    create: {
      name: "Marcus Chen",
      licenseNumber: "DL-2023-0088",
      licenseCategory: "HMV",
      licenseExpiryDate: new Date("2026-08-05"),
      contactNumber: "+1-555-0122",
      safetyScore: 82,
      status: "OFF_DUTY",
    },
  });

  await prisma.driver.upsert({
    where: { licenseNumber: "DL-2022-0021" },
    update: {},
    create: {
      name: "Elena Fischer",
      licenseNumber: "DL-2022-0021",
      licenseCategory: "LMV",
      licenseExpiryDate: new Date("2026-08-15"),
      contactNumber: "+1-555-0188",
      safetyScore: 65,
      status: "SUSPENDED",
    },
  });

  // ---------------------------------------------------------------------
  // Sample activity (trip history, fuel, expenses, maintenance) — only
  // seeded once, so re-running this script on an already-seeded DB is safe.
  // ---------------------------------------------------------------------
  const existingTrips = await prisma.trip.count();
  if (existingTrips === 0) {
    const dispatchedAt = new Date("2026-07-10T09:00:00Z");
    const completedAt = new Date("2026-07-10T12:30:00Z");

    const trip = await prisma.trip.create({
      data: {
        source: "Gandhinagar Depot",
        destination: "Ahmedabad Hub",
        status: "COMPLETED",
        vehicleId: van05.id,
        driverId: alex.id,
        cargoWeightKg: 450,
        plannedDistanceKm: 120,
        startOdometerKm: 0,
        finalOdometerKm: 120,
        actualDistanceKm: 120,
        fuelConsumedLtr: 14.5,
        revenue: 9500,
        dispatchedAt,
        completedAt,
        createdById: fleetManager.id,
      },
    });

    await prisma.vehicle.update({
      where: { id: van05.id },
      data: { odometerKm: 120 },
    });

    await prisma.fuelLog.create({
      data: {
        vehicleId: van05.id,
        tripId: trip.id,
        liters: 14.5,
        cost: 1650.75,
        date: completedAt,
        loggedById: driverUser.id,
      },
    });

    await prisma.expense.create({
      data: {
        vehicleId: van05.id,
        category: "TOLL",
        amount: 220,
        description: "NH-48 toll",
        date: completedAt,
        loggedById: driverUser.id,
      },
    });

    await prisma.maintenanceLog.create({
      data: {
        vehicleId: truck01.id,
        type: "Oil Change",
        description: "Routine engine service.",
        cost: 1500,
        status: "CLOSED",
        startDate: new Date("2026-07-05T08:00:00Z"),
        endDate: new Date("2026-07-05T11:00:00Z"),
        createdById: fleetManager.id,
      },
    });

    // BUS-02 is IN_SHOP, so it has a matching OPEN maintenance record.
    await prisma.maintenanceLog.create({
      data: {
        vehicleId: bus02.id,
        type: "Brake Inspection",
        description: "Front and rear brake pad inspection.",
        cost: 0,
        status: "OPEN",
        startDate: new Date("2026-07-11T08:00:00Z"),
        createdById: fleetManager.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("");
  console.log("Demo accounts (all share the password below):");
  console.log(`  Password: ${SEED_PASSWORD}`);
  console.log(`  ${admin.email}    (ADMIN)`);
  console.log(`  ${fleetManager.email}    (FLEET_MANAGER)`);
  console.log(`  ${driverUser.email}    (DRIVER)`);
  console.log(`  ${safetyOfficer.email}    (SAFETY_OFFICER)`);
  console.log(`  ${financialAnalyst.email}    (FINANCIAL_ANALYST)`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
