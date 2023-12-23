import { Router } from "express";
import { forgetPassword, getUser, login, logout, register, resetPassword } from "../controllers/user";
import validateId from "../middlewares/validateId";

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/forget-password", forgetPassword)
router.patch("/forget-password/:resetToken", resetPassword)
router.delete("/logout", logout)
router.get("/users/:userId", validateId, getUser)

export default router;