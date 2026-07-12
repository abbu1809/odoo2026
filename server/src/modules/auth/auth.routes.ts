import { Router } from "express";
import { prisma } from "../../config/prisma";
import { validate } from "../../middleware/validate.middleware";
import { requireAuth } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/ApiError";
import { loginSchema, registerSchema } from "./auth.validation";
import { loginUser, registerUser } from "./auth.service";

const router = Router();

router.post("/register", validate({ body: registerSchema }), async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json({ success: true, data: result });
});

router.post("/login", validate({ body: loginSchema }), async (req, res) => {
  const result = await loginUser(req.body);
  res.json({ success: true, data: result });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      driverProfile: { select: { id: true, name: true, status: true } },
    },
  });
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
});

export default router;
