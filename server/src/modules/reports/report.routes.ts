import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { toCsv } from "../../utils/csv";
import { getVehicleReports } from "./report.service";
import { getKpis } from "../dashboard/dashboard.service";

const router = Router();

router.use(requireAuth);

// Section 3.8 - Fuel Efficiency, Operational Cost, Vehicle ROI (per vehicle),
// plus overall Fleet Utilization. Add ?format=csv to export as CSV.
router.get("/overview", async (req, res) => {
  const vehicleId = typeof req.query.vehicleId === "string" ? req.query.vehicleId : undefined;
  const [vehicles, fleet] = await Promise.all([getVehicleReports(vehicleId), getKpis({})]);

  if (req.query.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transitops-report.csv");
    res.send(toCsv(vehicles as unknown as Record<string, unknown>[]));
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
