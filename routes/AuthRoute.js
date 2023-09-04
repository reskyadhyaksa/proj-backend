import express from "express";
import {
    LogIn,
    LogOut,
    Me
} from "../controllers/Auth.js";

const router = express.Router();

router.post("/api/login", LogIn)
router.get("/api/me", Me)
router.delete("/api/logout", LogOut)

export default router;
