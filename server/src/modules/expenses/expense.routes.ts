import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { ExpenseCategory, UserRole } from "../../../generated/prisma/enums";
import { createExpenseSchema, listExpensesQuerySchema, updateExpenseSchema } from "./expense.validation";

const router = Router();
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.DRIVER];

router.use(requireAuth);

// Section 3.7 - miscellaneous operational expenses (tolls, fines, permits...).
router.get("/", validate({ query: listExpensesQuerySchema }), async (req, res) => {
  const { vehicleId, category, from, to, page, pageSize } = req.validatedQuery as unknown as {
    vehicleId?: string;
    category?: ExpenseCategory;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  };

  const where = {
    ...(vehicleId ? { vehicleId } : {}),
    ...(category ? { category } : {}),
    ...(from || to
      ? { date: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } }
      : {}),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { vehicle: { select: { id: true, registrationNumber: true, name: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.expense.count({ where }),
  ]);

  res.json({ success: true, data: expenses, meta: { page, pageSize, total } });
});

router.get("/:id", async (req, res) => {
  const expense = await prisma.expense.findUnique({ where: { id: requireParam(req, "id") } });
  if (!expense) throw ApiError.notFound("Expense not found");
  res.json({ success: true, data: expense });
});

router.post("/", requireRole(...MANAGE_ROLES), validate({ body: createExpenseSchema }), async (req, res) => {
  const expense = await prisma.expense.create({ data: { ...req.body, loggedById: req.user!.id } });
  res.status(201).json({ success: true, data: expense });
});

router.patch("/:id", requireRole(...MANAGE_ROLES), validate({ body: updateExpenseSchema }), async (req, res) => {
  const expense = await prisma.expense.update({ where: { id: requireParam(req, "id") }, data: req.body });
  res.json({ success: true, data: expense });
});

router.delete("/:id", requireRole(...MANAGE_ROLES), async (req, res) => {
  await prisma.expense.delete({ where: { id: requireParam(req, "id") } });
  res.status(204).send();
});

export default router;
