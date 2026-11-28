import express from "express"
import { getAuthenticatedUser, login, logOut, register } from "../controllers/auth.controller.js"
import { manualAuthRateLimit, requireSession } from "../../../shared/auth/index.js"

const router= express.Router()

router.post("/register", manualAuthRateLimit, register)
router.post("/login", manualAuthRateLimit, login)
router.get("/me", requireSession, getAuthenticatedUser)
router.post("/logout", logOut)
// Keep the existing Google sign-out URL working for older clients.
router.get("/logout", logOut)

export default router
