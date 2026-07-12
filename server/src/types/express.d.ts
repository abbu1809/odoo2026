import type { UserRole } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      /** Populated by auth.middleware after verifying the JWT. */
      user?: {
        id: string;
        role: UserRole;
        email: string;
      };
      /**
       * Populated by validate.middleware. Express 5 makes `req.query` a
       * getter-only accessor, so parsed/coerced query values are stashed
       * here instead of being written back onto `req.query`.
       */
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export {};
