import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { signToken } from "../../utils/jwt";
import type { RegisterInput, LoginInput } from "./auth.validation";

const SALT_ROUNDS = 10;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user, token };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}
