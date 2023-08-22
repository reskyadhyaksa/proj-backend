import express from "express";
import {
    getTotalClicks,
    getTotalShopeeClicks,
    getTotalTokopediaClicks,
    getWebVistors,
} from "../controllers/Analytics.js";

const router = express.Router();

import { VerifyUser } from "../middleware/AuthUser.js";
import { trackWebVisitors } from "../middleware/TrackVisitors.js";

router.get('/', trackWebVisitors, (req, res) => {
    res.render('homepage', { title: 'Home' });
});
router.get("/analytics/web-visitors", VerifyUser, getWebVistors);
router.get("/analytics/total-clicks", getTotalClicks);
router.get("/analytics/total-shopee-clicks", getTotalShopeeClicks);
router.get("/analytics/total-tokopedia-clicks", getTotalTokopediaClicks);

export default router;