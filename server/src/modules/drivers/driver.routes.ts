import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { DriverStatus, UserRole } from "../../../generated/prisma/enums";
import { createDriverSchema, listDriversQuerySchema, updateDriverSchema } from "./driver.validation";

const router = Router();
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER];

router.use(requireAuth);

// Section 3.4 - driver profiles, with a compliance filter for Safety Officers.
router.get("/", validate({ query: listDriversQuerySchema }), async (req, res) => {
  const { status, search, expiringWithinDays, page, pageSize } = req.validatedQuery as unknown as {
    status?: DriverStatus;
    search?: string;
    expiringWithinDays?: number;
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

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.driver.count({ where }),
  ]);

  res.json({ success: true, data: drivers, meta: { page, pageSize, total } });
});

router.get("/:id", async (req, res) => {
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
