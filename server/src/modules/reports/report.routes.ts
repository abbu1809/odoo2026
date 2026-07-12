import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { toCsv } from "../../utils/csv";
import { renderTablePdf } from "../../utils/pdf";
import { UserRole } from "../../../generated/prisma/enums";
import { getVehicleReports } from "./report.service";
import { getKpis } from "../dashboard/dashboard.service";

const router = Router();

// Section 8 (RBAC) - "Analytics" column: Fleet Manager and Financial
// Analyst can view it; Driver and Safety Officer have no access at all.
// (This is distinct from /dashboard/kpis, the shared landing page, which
// stays open to every authenticated role.)
const READ_ROLES = [UserRole.ADMIN, UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST];

router.use(requireAuth);

// Section 3.8 - Fuel Efficiency, Operational Cost, Vehicle ROI (per vehicle),
// plus overall Fleet Utilization. Add ?format=csv or ?format=pdf to export.
router.get("/overview", requireRole(...READ_ROLES), async (req, res) => {
  const vehicleId = typeof req.query.vehicleId === "string" ? req.query.vehicleId : undefined;
  const [vehicles, fleet] = await Promise.all([getVehicleReports(vehicleId), getKpis({})]);

  if (req.query.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transitops-report.csv");
    res.send(toCsv(vehicles as unknown as Record<string, unknown>[]));
    return;
  }

  if (req.query.format === "pdf") {
    renderTablePdf(res, {
      title: "TransitOps - Fleet Report",
      filename: "transitops-report.pdf",
      columns: [
        { key: "registrationNumber", label: "Vehicle" },
        { key: "totalDistanceKm", label: "Distance (km)" },
        { key: "totalFuelLiters", label: "Fuel (L)" },
        { key: "fuelEfficiencyKmPerLtr", label: "Efficiency (km/L)" },
        { key: "operationalCost", label: "Op. Cost" },
        { key: "totalRevenue", label: "Revenue" },
        { key: "roi", label: "ROI" },
      ],
      rows: vehicles as unknown as Record<string, unknown>[],
    });
    return;
  }

  res.json({
    success: true,
    data: {
      vehicles,
      fleetUtilizationPct: fleet.fleetUtilizationPct,
    },
  });
});

export default router;
