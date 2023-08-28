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
    getBestSellerProducts,
    getHotDealProducts,
    getNewCollectionProducts,
    getMostViewedProducts,
    incrShopeeClick,
    incrTokopediaClick

} from "../controllers/Products.js";

import { VerifyUser } from "../middleware/AuthUser.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();

router.get("/product", getProducts);
router.get("/product/search", searchProduct);
router.get("/product/info/:id", getProductById);
router.get("/product/slug/:slug", getProductBySlug);
router.post("/product", VerifyUser ,upload.array('images', 10), createProduct);
router.patch("/product/:id/edit", VerifyUser, upload.array('images', 10), updateProduct);
router.delete("/product/:id/delete", VerifyUser, deleteProduct);

router.get("/product/search/price", getProductByPrice);
router.get("/product/best-seller", getBestSellerProducts);
router.get("/product/hot-deal", getHotDealProducts);
router.get("/product/new-collection", getNewCollectionProducts);
router.get("/product/most-viewed", getMostViewedProducts);

router.post("/product/link/shopee/:id", incrShopeeClick );
router.post("/product/link/tokopedia/:id", incrTokopediaClick);

export default router;