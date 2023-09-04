import express from "express";

import { 
    trackWebVisitors,
    getWebVistors,
    getMonthlyData,
    getWeeklyData,
    getTotalLinkClicks
} from "../controllers/Analytics.js";

const router = express.Router();

import { VerifyUser } from "../middleware/AuthUser.js";

router.post("/api/track-web-visitor", trackWebVisitors);
router.get("/api/analytics/web-visitors", VerifyUser, getWebVistors);
router.get("/api/analytics/product-monthly", VerifyUser, getMonthlyData);
router.get("/api/analytics/product-weekly", VerifyUser, getWeeklyData);
router.get("/api/analytics/total-link-visited", VerifyUser, getTotalLinkClicks);

export default router;
