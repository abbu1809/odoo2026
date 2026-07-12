import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { kpiQuerySchema } from "./dashboard.validation";
import { getKpis, type KpiFilters } from "./dashboard.service";

const router = Router();

router.use(requireAuth);

router.get("/kpis", validate({ query: kpiQuerySchema }), async (req, res) => {
  const kpis = await getKpis(req.validatedQuery as unknown as KpiFilters);
  res.json({ success: true, data: kpis });
});

export default router;
