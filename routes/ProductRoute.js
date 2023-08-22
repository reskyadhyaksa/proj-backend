import express from "express";
import {
    getProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    getProductByPrice,
    getHotDealProducts,
    getNewCollectionProducts,
    getMostViewedProducts,
    incrShopeeClick,
    incrTokopediaClick
} from "../controllers/Products.js";

import { VerifyUser } from "../middleware/AuthUser.js";
import Upload from "../middleware/multerConfig.js";
import { trackWebVisitors } from "../middleware/TrackVisitors.js";

const router = express.Router();

router.get("/products", trackWebVisitors, getProducts);
router.get("/products/search", searchProduct);
router.get("/products/id/:id", getProductById);
router.get("/products/:slug", getProductBySlug);
router.post("/products", VerifyUser, Upload.array('image', 5), createProduct);
router.patch("/products/:id", VerifyUser, updateProduct);
router.delete("/products/:id", VerifyUser, deleteProduct);

router.get("/products/price", getProductByPrice);
router.get("/products/hot-deal", getHotDealProducts);
router.get("/products/new-collection", getNewCollectionProducts);
router.get("/products/most-viewed", getMostViewedProducts);

router.post("/products/clicks/shopee/:id", incrShopeeClick );
router.post("/products/clicks/tokopedia/:id", incrTokopediaClick);

export default router;