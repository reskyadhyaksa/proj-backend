import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/Users.js";
import { VerifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/api/users", VerifyUser, getUsers);
router.get("/api/users/:id", VerifyUser, getUserById);
router.post("/api/users", createUser);
router.patch("/api/users/:id", VerifyUser, updateUser);
router.delete("/api/users/:id", VerifyUser, deleteUser);

export default router;