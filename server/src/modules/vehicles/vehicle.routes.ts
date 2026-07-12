import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { Region, UserRole, VehicleStatus, VehicleType } from "../../../generated/prisma/enums";
import { toCsv } from "../../utils/csv";
import { createVehicleSchema, listVehiclesQuerySchema, updateVehicleSchema } from "./vehicle.validation";

const router = Router();

// Section 8 (RBAC) - "Fleet" column: Fleet Manager manages it, Driver and
// Financial Analyst can view it, Safety Officer has no access at all.
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER];
const READ_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.FINANCIAL_ANALYST];

router.use(requireAuth);

// Section 3.3 - master vehicle list, with filters for type/status/region (section 3.2).
router.get(
  "/",
  requireRole(...READ_ROLES),
  validate({ query: listVehiclesQuerySchema }),
  async (req, res) => {
    const { type, status, region, search, sortBy, sortOrder, format, page, pageSize } =
      req.validatedQuery as unknown as {
        type?: VehicleType;
        status?: VehicleStatus;
        region?: Region;
        search?: string;
        sortBy: "registrationNumber" | "name" | "odometerKm" | "acquisitionCost" | "createdAt";
        sortOrder: "asc" | "desc";
        format?: "csv";
        page: number;
        pageSize: number;
      };

    const where = {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(region ? { region } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { registrationNumber: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    if (format === "csv") {
      const vehicles = await prisma.vehicle.findMany({ where, orderBy: { [sortBy]: sortOrder } });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=vehicles.csv");
      res.send(toCsv(vehicles as unknown as Record<string, unknown>[]));
      return;
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({ success: true, data: vehicles, meta: { page, pageSize, total } });
  },
);

router.get("/:id", requireRole(...READ_ROLES), async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: requireParam(req, "id") },
    include: {
      trips: { orderBy: { createdAt: "desc" }, take: 5 },
      maintenanceLogs: { orderBy: { createdAt: "desc" }, take: 5 },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!vehicle) throw ApiError.notFound("Vehicle not found");
  res.json({ success: true, data: vehicle });
});

router.post("/", requireRole(...MANAGE_ROLES), validate({ body: createVehicleSchema }), async (req, res) => {
  const vehicle = await prisma.vehicle.create({ data: req.body });
  res.status(201).json({ success: true, data: vehicle });
});

router.patch("/:id", requireRole(...MANAGE_ROLES), validate({ body: updateVehicleSchema }), async (req, res) => {
  const vehicle = await prisma.vehicle.update({ where: { id: requireParam(req, "id") }, data: req.body });
  res.json({ success: true, data: vehicle });
});

router.delete("/:id", requireRole(UserRole.ADMIN), async (req, res) => {
  await prisma.vehicle.delete({ where: { id: requireParam(req, "id") } });
  res.status(204).send();
});

export default router;
