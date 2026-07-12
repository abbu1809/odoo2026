import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { UserRole } from "../../../generated/prisma/enums";
import { createFuelLogSchema, listFuelLogsQuerySchema, updateFuelLogSchema } from "./fuel.validation";

const router = Router();
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.DRIVER];

router.use(requireAuth);

// Section 3.7 - fuel logs (liters, cost, date), optionally tied to a trip.
router.get("/", validate({ query: listFuelLogsQuerySchema }), async (req, res) => {
  const { vehicleId, tripId, from, to, page, pageSize } = req.validatedQuery as unknown as {
    vehicleId?: string;
    tripId?: string;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  };

  const where = {
    ...(vehicleId ? { vehicleId } : {}),
    ...(tripId ? { tripId } : {}),
    ...(from || to
      ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.fuelLog.findMany({
      where,
      include: { vehicle: { select: { id: true, registrationNumber: true, name: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.fuelLog.count({ where }),
  ]);

  res.json({ success: true, data: logs, meta: { page, pageSize, total } });
});

router.get("/:id", async (req, res) => {
  const log = await prisma.fuelLog.findUnique({ where: { id: requireParam(req, "id") } });
  if (!log) throw ApiError.notFound("Fuel log not found");
  res.json({ success: true, data: log });
});

router.post("/", requireRole(...MANAGE_ROLES), validate({ body: createFuelLogSchema }), async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.body.vehicleId } });
  if (!vehicle) throw ApiError.notFound("Vehicle not found");

  const log = await prisma.fuelLog.create({
    data: { ...req.body, loggedById: req.user!.id },
  });
  res.status(201).json({ success: true, data: log });
});

router.patch("/:id", requireRole(...MANAGE_ROLES), validate({ body: updateFuelLogSchema }), async (req, res) => {
  const log = await prisma.fuelLog.update({ where: { id: requireParam(req, "id") }, data: req.body });
  res.json({ success: true, data: log });
});

router.delete("/:id", requireRole(...MANAGE_ROLES), async (req, res) => {
  await prisma.fuelLog.delete({ where: { id: requireParam(req, "id") } });
  res.status(204).send();
});

export default router;
