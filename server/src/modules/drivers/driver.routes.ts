import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { DriverStatus, UserRole } from "../../../generated/prisma/enums";
import { toCsv } from "../../utils/csv";
import { createDriverSchema, listDriversQuerySchema, updateDriverSchema } from "./driver.validation";

const router = Router();

// Section 8 (RBAC) - "Drivers" column: Fleet Manager and Safety Officer own
// it end to end; Driver and Financial Analyst have no access at all.
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER];
const READ_ROLES = MANAGE_ROLES;

router.use(requireAuth);

// Section 3.4 - driver profiles, with a compliance filter for Safety Officers.
router.get(
  "/",
  requireRole(...READ_ROLES),
  validate({ query: listDriversQuerySchema }),
  async (req, res) => {
    const { status, search, expiringWithinDays, sortBy, sortOrder, format, page, pageSize } =
      req.validatedQuery as unknown as {
        status?: DriverStatus;
        search?: string;
        expiringWithinDays?: number;
        sortBy: "name" | "licenseExpiryDate" | "safetyScore" | "createdAt";
        sortOrder: "asc" | "desc";
        format?: "csv";
        page: number;
        pageSize: number;
      };

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { licenseNumber: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(expiringWithinDays !== undefined
        ? {
            licenseExpiryDate: {
              lte: new Date(Date.now() + expiringWithinDays * 24 * 60 * 60 * 1000),
            },
          }
        : {}),
    };

    if (format === "csv") {
      const drivers = await prisma.driver.findMany({ where, orderBy: { [sortBy]: sortOrder } });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=drivers.csv");
      res.send(toCsv(drivers as unknown as Record<string, unknown>[]));
      return;
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.driver.count({ where }),
    ]);

    res.json({ success: true, data: drivers, meta: { page, pageSize, total } });
  },
);

router.get("/:id", requireRole(...READ_ROLES), async (req, res) => {
  const driver = await prisma.driver.findUnique({
    where: { id: requireParam(req, "id") },
    include: { trips: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!driver) throw ApiError.notFound("Driver not found");
  res.json({ success: true, data: driver });
});

router.post("/", requireRole(...MANAGE_ROLES), validate({ body: createDriverSchema }), async (req, res) => {
  const driver = await prisma.driver.create({ data: req.body });
  res.status(201).json({ success: true, data: driver });
});

router.patch("/:id", requireRole(...MANAGE_ROLES), validate({ body: updateDriverSchema }), async (req, res) => {
  const driver = await prisma.driver.update({ where: { id: requireParam(req, "id") }, data: req.body });
  res.json({ success: true, data: driver });
});

router.delete("/:id", requireRole(UserRole.ADMIN), async (req, res) => {
  await prisma.driver.delete({ where: { id: requireParam(req, "id") } });
  res.status(204).send();
});

export default router;
