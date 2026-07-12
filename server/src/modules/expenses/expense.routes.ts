import { Router } from "express";
import { prisma } from "../../config/prisma";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { ExpenseCategory, UserRole } from "../../../generated/prisma/enums";
import { toCsv } from "../../utils/csv";
import { createExpenseSchema, listExpensesQuerySchema, updateExpenseSchema } from "./expense.validation";

const router = Router();

// Section 8 (RBAC) - "Fuel/Exp." column: Financial Analyst owns this
// end to end; every other role (including Fleet Manager and Driver) has
// no access at all.
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FINANCIAL_ANALYST];
const READ_ROLES = MANAGE_ROLES;

router.use(requireAuth);

// Section 3.7 - miscellaneous operational expenses (tolls, fines, permits...).
router.get(
  "/",
  requireRole(...READ_ROLES),
  validate({ query: listExpensesQuerySchema }),
  async (req, res) => {
    const { vehicleId, category, from, to, sortBy, sortOrder, format, page, pageSize } =
      req.validatedQuery as unknown as {
        vehicleId?: string;
        category?: ExpenseCategory;
        from?: Date;
        to?: Date;
        sortBy: "amount" | "category" | "date";
        sortOrder: "asc" | "desc";
        format?: "csv";
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

    if (format === "csv") {
      const expenses = await prisma.expense.findMany({ where, orderBy: { [sortBy]: sortOrder } });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
      res.send(toCsv(expenses as unknown as Record<string, unknown>[]));
      return;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { vehicle: { select: { id: true, registrationNumber: true, name: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({ success: true, data: expenses, meta: { page, pageSize, total } });
  },
);

router.get("/:id", requireRole(...READ_ROLES), async (req, res) => {
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
