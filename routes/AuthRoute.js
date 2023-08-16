import express from "express";
import {
    LogIn,
    LogOut,
    Me
} from "../controllers/Auth.js";

const router = express.Router();

router.post("/login", LogIn)
router.get("/me", Me)
router.delete("/logout", LogOut)

export default router;
