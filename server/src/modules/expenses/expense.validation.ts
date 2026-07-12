import { z } from "zod";
import { ExpenseCategory } from "../../../generated/prisma/enums";

export const createExpenseSchema = z.object({
  vehicleId: z.string().min(1).optional(),
  category: z.enum(ExpenseCategory),
  amount: z.number().positive(),
  date: z.coerce.date().optional(),
  description: z.string().trim().max(500).optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpensesQuerySchema = z.object({
  vehicleId: z.string().optional(),
  category: z.enum(ExpenseCategory).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
