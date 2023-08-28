import express from "express";
import {
    getTotalClicks,
    getTotalShopeeClicks,
    getTotalTokopediaClicks,
    getWebVistors,
    trackWebVisitors,
} from "../controllers/Analytics.js";

const router = express.Router();

import { VerifyUser } from "../middleware/AuthUser.js";

router.post("/track-web-visitor", trackWebVisitors);
router.get("/analytics/web-visitors", VerifyUser, getWebVistors);
router.get("/analytics/total-clicks", getTotalClicks);
router.get("/analytics/total-shopee-clicks", getTotalShopeeClicks);
router.get("/analytics/total-tokopedia-clicks", getTotalTokopediaClicks);

export default router;