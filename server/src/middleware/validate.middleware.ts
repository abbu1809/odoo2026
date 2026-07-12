import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        // req.query is a getter-only accessor in Express 5; stash the
        // parsed/coerced result separately instead of reassigning it.
        req.validatedQuery = schemas.query.parse(req.query) as Record<string, unknown>;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(ApiError.badRequest("Validation failed", error.issues));
        return;
      }
      next(error);
    }
  };
}
