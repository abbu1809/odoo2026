import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { UserRole, VehicleStatus, VehicleType } from "../../../generated/prisma/enums";
import { createVehicleSchema, listVehiclesQuerySchema, updateVehicleSchema } from "./vehicle.validation";

const router = Router();
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER];

router.use(requireAuth);

// Section 3.3 - master vehicle list, with filters for type/status/region (section 3.2).
router.get("/", validate({ query: listVehiclesQuerySchema }), async (req, res) => {
  const { type, status, region, search, page, pageSize } = req.validatedQuery as unknown as {
    type?: VehicleType;
    status?: VehicleStatus;
    region?: string;
    search?: string;
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

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vehicle.count({ where }),
  ]);

  res.json({ success: true, data: vehicles, meta: { page, pageSize, total } });
});

router.get("/:id", async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: requireParam(req, "id") },
    include: {
      trips: { orderBy: { createdAt: "desc" }, take: 5 },
      maintenanceLogs: { orderBy: { createdAt: "desc" }, take: 5 },
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
