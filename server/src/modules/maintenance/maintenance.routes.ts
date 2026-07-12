import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { MaintenanceStatus, UserRole } from "../../../generated/prisma/enums";
import {
  createMaintenanceSchema,
  listMaintenanceQuerySchema,
  updateMaintenanceSchema,
} from "./maintenance.validation";
import { closeMaintenance, openMaintenance } from "./maintenance.service";

const router = Router();

// Section 8 (RBAC) - falls under the "Fleet" column: Fleet Manager manages
// it, Driver and Financial Analyst can view, Safety Officer has no access.
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER];
const READ_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.FINANCIAL_ANALYST];

router.use(requireAuth);

router.get(
  "/",
  requireRole(...READ_ROLES),
  validate({ query: listMaintenanceQuerySchema }),
  async (req, res) => {
    const { vehicleId, status, page, pageSize } = req.validatedQuery as unknown as {
      vehicleId?: string;
      status?: MaintenanceStatus;
      page: number;
      pageSize: number;
    };

    const where = {
      ...(vehicleId ? { vehicleId } : {}),
      ...(status ? { status } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.maintenanceLog.findMany({
        where,
        include: { vehicle: { select: { id: true, registrationNumber: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.maintenanceLog.count({ where }),
    ]);

    res.json({ success: true, data: logs, meta: { page, pageSize, total } });
  },
);

router.get("/:id", requireRole(...READ_ROLES), async (req, res) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id: requireParam(req, "id") },
    include: { vehicle: true },
  });
  if (!log) throw ApiError.notFound("Maintenance record not found");
  res.json({ success: true, data: log });
});

// Opens a maintenance record; vehicle status automatically becomes IN_SHOP.
router.post("/", requireRole(...MANAGE_ROLES), validate({ body: createMaintenanceSchema }), async (req, res) => {
  const log = await openMaintenance(req.body, req.user!.id);
  res.status(201).json({ success: true, data: log });
});

router.patch(
  "/:id",
  requireRole(...MANAGE_ROLES),
  validate({ body: updateMaintenanceSchema }),
  async (req, res) => {
    const log = await prisma.maintenanceLog.update({ where: { id: requireParam(req, "id") }, data: req.body });
    res.json({ success: true, data: log });
  },
);

// Closes a maintenance record; vehicle status reverts to AVAILABLE unless RETIRED.
router.post("/:id/close", requireRole(...MANAGE_ROLES), async (req, res) => {
  const log = await closeMaintenance(requireParam(req, "id"));
  res.json({ success: true, data: log });
});

export default router;
