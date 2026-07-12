import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        success: false,
        message: `A record with this ${(err.meta?.target as string[] | undefined)?.join(", ") ?? "value"} already exists`,
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }
    if (err.code === "P2003") {
      res.status(409).json({
        success: false,
        message: "This record is referenced by other records and cannot be modified/deleted",
      });
      return;
    }
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    stack: env.nodeEnv === "development" && err instanceof Error ? err.stack : undefined,
  });
}
