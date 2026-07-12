import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { UserRole } from "../../../generated/prisma/enums";
import { listUsersQuerySchema, updateUserSchema } from "./user.validation";

const router = Router();
const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

router.use(requireAuth);

router.get("/", requireRole(UserRole.ADMIN), validate({ query: listUsersQuerySchema }), async (req, res) => {
  const { role, isActive, page, pageSize } = req.validatedQuery as unknown as {
    role?: UserRole;
    isActive?: boolean;
    page: number;
    pageSize: number;
  };

  const where = {
    ...(role ? { role } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_SAFE_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ success: true, data: users, meta: { page, pageSize, total } });
});

router.get("/:id", requireRole(UserRole.ADMIN), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: requireParam(req, "id") }, select: USER_SAFE_SELECT });
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
});

router.patch("/:id", requireRole(UserRole.ADMIN), validate({ body: updateUserSchema }), async (req, res) => {
  const user = await prisma.user.update({
    where: { id: requireParam(req, "id") },
    data: req.body,
    select: USER_SAFE_SELECT,
  });
  res.json({ success: true, data: user });
});

export default router;
