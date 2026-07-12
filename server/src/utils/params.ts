import type { Request } from "express";
import { ApiError } from "./ApiError";

/** Safely extracts a required `:id`-style route param as a plain string. */
export function requireParam(req: Request, name: string): string {
  const value = req.params[name];
  if (!value || Array.isArray(value)) {
    throw ApiError.badRequest(`Missing route parameter: ${name}`);
  }
  return value;
}
