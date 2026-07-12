import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { ApiError } from "../../utils/ApiError";
import { requireParam } from "../../utils/params";
import { UserRole } from "../../../generated/prisma/enums";
import { uploadVehicleDocumentSchema } from "./vehicleDocument.validation";

// Todo.md - vehicle document management (RC, insurance, permits...), stored
// on local disk under a Docker-mounted volume (see docker-compose.yml).
const STORAGE_DIR = path.join(process.cwd(), env.uploadsDir, "vehicle-docs");
fs.mkdirSync(STORAGE_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: STORAGE_DIR,
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

// Documents follow the same RBAC as the "Fleet" column (section 8).
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER];
const READ_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.FINANCIAL_ANALYST];

router.use(requireAuth);

router.get("/vehicles/:vehicleId/documents", requireRole(...READ_ROLES), async (req, res) => {
  const documents = await prisma.vehicleDocument.findMany({
    where: { vehicleId: requireParam(req, "vehicleId") },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: documents });
});

router.post(
  "/vehicles/:vehicleId/documents",
  requireRole(...MANAGE_ROLES),
  upload.single("file"),
  async (req, res) => {
    const vehicleId = requireParam(req, "vehicleId");
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw ApiError.notFound("Vehicle not found");
    if (!req.file) throw ApiError.badRequest("A file is required");

    const { label } = uploadVehicleDocumentSchema.parse({ label: req.body.label });

    const document = await prisma.vehicleDocument.create({
      data: {
        vehicleId,
        label,
        fileName: req.file.originalname,
        filePath: req.file.path,
        mimeType: req.file.mimetype,
        fileSizeBytes: req.file.size,
        uploadedById: req.user!.id,
      },
    });
    res.status(201).json({ success: true, data: document });
  },
);

router.get("/vehicle-documents/:id/download", requireRole(...READ_ROLES), async (req, res) => {
  const document = await prisma.vehicleDocument.findUnique({ where: { id: requireParam(req, "id") } });
  if (!document) throw ApiError.notFound("Document not found");
  res.download(document.filePath, document.fileName);
});

router.delete("/vehicle-documents/:id", requireRole(...MANAGE_ROLES), async (req, res) => {
  const document = await prisma.vehicleDocument.findUnique({ where: { id: requireParam(req, "id") } });
  if (!document) throw ApiError.notFound("Document not found");
  await prisma.vehicleDocument.delete({ where: { id: document.id } });
  fs.unlink(document.filePath, () => {
    // Best-effort cleanup - a missing file on disk shouldn't fail the request.
  });
  res.status(204).send();
});

export default router;
