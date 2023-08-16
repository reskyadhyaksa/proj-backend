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

router.get("/users", VerifyUser, getUsers);
router.get("/users/:id", VerifyUser, getUserById);
router.post("/users", VerifyUser, createUser);
router.patch("/users/:id", VerifyUser, updateUser);
router.delete("/users/:id", VerifyUser, deleteUser);

export default router;