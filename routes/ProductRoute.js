import express from "express";
import {
    getAllProducts,
    getProducts,
    getSingleProduct,
    createProduct,
    updateProduct,
    deleteProduct, 
    updateHotDeal,
    getBestSellerProducts,
    getHotDealProducts,
    getNewCollectionProducts,
    getMostViewedProducts,
    incrShopeeClick,
    incrTokopediaClick,
    getSimilarProduct
} from "../controllers/Products.js";

import { VerifyUser } from "../middleware/AuthUser.js";
import upload from "../middleware/multerConfig.js";

const router = express.Router();

router.get("/api/products", getProducts);
router.get("/api/products/all", getAllProducts);
router.get("/api/products/info", getSingleProduct);
router.get("/api/products/similar-product", getSimilarProduct);
router.post("/api/products", upload.array('images', 10), createProduct);
router.patch("/api/products", VerifyUser, upload.array('images', 10), updateProduct);
router.delete("/api/products", VerifyUser, deleteProduct);
router.patch("/api/products/edit-hot-deal", VerifyUser, updateHotDeal);

router.get("/api/products/best-seller", getBestSellerProducts);
router.get("/api/products/hot-deal", getHotDealProducts);
router.get("/api/products/new-collection", getNewCollectionProducts);
router.get("/api/products/most-viewed", getMostViewedProducts);

router.post("/api/products/shopee-link/:productId", incrShopeeClick);
router.post("/api/products/tokopedia-link/:productId", incrTokopediaClick);

export default router;