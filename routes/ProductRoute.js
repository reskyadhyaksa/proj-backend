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
    getMostViewedProducts
} from "../controllers/Products.js";

import { VerifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/search", searchProduct);
router.get("/products/id/:id", getProductById);
router.get("/products/:slug", getProductBySlug);
router.post("/products", VerifyUser, createProduct);
router.patch("/products/:id", VerifyUser, updateProduct);
router.delete("/products/:id", VerifyUser, deleteProduct);

router.get("/products/price", getProductByPrice);
router.get("/products/hot-deal", getHotDealProducts);
router.get("/products/new-collection", getNewCollectionProducts);
router.get("/products/most-viewed", getMostViewedProducts);

export default router;