import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { TripStatus, UserRole } from "../../../generated/prisma/enums";
import { toCsv } from "../../utils/csv";
import {
  completeTripSchema,
  createTripSchema,
  listTripsQuerySchema,
  updateTripSchema,
} from "./trip.validation";
import { cancelTrip, completeTrip, createTrip, dispatchTrip } from "./trip.service";

const router = Router();

// Section 8 (RBAC) - "Trips" column: Driver (the dispatcher persona) owns
// it end to end; Safety Officer can view; Fleet Manager and Financial
// Analyst have no access at all.
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.DRIVER];
const READ_ROLES = [UserRole.ADMIN, UserRole.DRIVER, UserRole.SAFETY_OFFICER];

router.use(requireAuth);

// Section 3.5 - trip listing with status/vehicle/driver filters.
router.get(
  "/",
  requireRole(...READ_ROLES),
  validate({ query: listTripsQuerySchema }),
  async (req, res) => {
    const { status, vehicleId, driverId, sortBy, sortOrder, format, page, pageSize } =
      req.validatedQuery as unknown as {
        status?: TripStatus;
        vehicleId?: string;
        driverId?: string;
        sortBy: "source" | "destination" | "cargoWeightKg" | "plannedDistanceKm" | "createdAt";
        sortOrder: "asc" | "desc";
        format?: "csv";
        page: number;
        pageSize: number;
      };

    const where = {
      ...(status ? { status } : {}),
      ...(vehicleId ? { vehicleId } : {}),
      ...(driverId ? { driverId } : {}),
    };

    if (format === "csv") {
      const trips = await prisma.trip.findMany({
        where,
        include: {
          vehicle: { select: { registrationNumber: true } },
          driver: { select: { name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=trips.csv");
      res.send(toCsv(trips as unknown as Record<string, unknown>[]));
      return;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          vehicle: { select: { id: true, registrationNumber: true, name: true } },
          driver: { select: { id: true, name: true, licenseNumber: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.trip.count({ where }),
    ]);

    res.json({ success: true, data: trips, meta: { page, pageSize, total } });
  },
);

router.get("/:id", requireRole(...READ_ROLES), async (req, res) => {
  const trip = await prisma.trip.findUnique({
    where: { id: requireParam(req, "id") },
    include: { vehicle: true, driver: true, fuelLogs: true },
  });
  if (!trip) throw ApiError.notFound("Trip not found");
  res.json({ success: true, data: trip });
});

// Creates a Draft trip. Vehicle/driver must both be AVAILABLE and cargo
// weight must not exceed the vehicle's max load capacity (section 4).
router.post("/", requireRole(...MANAGE_ROLES), validate({ body: createTripSchema }), async (req, res) => {
  const trip = await createTrip(req.body, req.user!.id);
  res.status(201).json({ success: true, data: trip });
});

router.patch(
  "/:id",
  requireRole(...MANAGE_ROLES),
  validate({ body: updateTripSchema }),
  async (req, res) => {
    const existing = await prisma.trip.findUnique({ where: { id: requireParam(req, "id") } });
    if (!existing) throw ApiError.notFound("Trip not found");
    if (existing.status !== TripStatus.DRAFT) {
      throw ApiError.conflict("Only DRAFT trips can be edited");
    }
    const trip = await prisma.trip.update({ where: { id: requireParam(req, "id") }, data: req.body });
    res.json({ success: true, data: trip });
  },
);

// Draft -> Dispatched: locks the vehicle and driver (status -> ON_TRIP).
router.post("/:id/dispatch", requireRole(...MANAGE_ROLES), async (req, res) => {
  const trip = await dispatchTrip(requireParam(req, "id"));
  res.json({ success: true, data: trip });
});

// Dispatched -> Completed: releases the vehicle/driver back to AVAILABLE.
router.post(
  "/:id/complete",
  requireRole(...MANAGE_ROLES),
  validate({ body: completeTripSchema }),
  async (req, res) => {
    const trip = await completeTrip(requireParam(req, "id"), req.body);
    res.json({ success: true, data: trip });
  },
);

// Draft/Dispatched -> Cancelled: releases the vehicle/driver if they were locked.
router.post("/:id/cancel", requireRole(...MANAGE_ROLES), async (req, res) => {
  const trip = await cancelTrip(requireParam(req, "id"));
  res.json({ success: true, data: trip });
});

export default router;
