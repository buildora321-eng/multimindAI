import { getAuth } from "firebase-admin/auth"
import { randomUUID } from "node:crypto"
import { app } from "../config/firebase.js"
import User from "../models/user.model.js"
import {
    comparePassword,
    createSession,
    getSessionCookieName,
    getSessionCookieOptions,
    hashPassword,
    invalidateSession,
    normalizeEmail,
    validateLogin,
    validateRegistration
} from "../../../shared/auth/index.js"

const loginWithGoogle = async (token, res) => {
    if (typeof token !== "string" || !token) {
        return res.status(400).json({ message: "Firebase token is required." });
    }

    const decoded = await getAuth(app).verifyIdToken(token)
    let user = await User.findOne({ firebaseUid: decoded.uid })

    if (!user) {
        const email = normalizeEmail(decoded.email)
        user = email ? await User.findOne({ email }) : null

        if (user) {
            if (user.firebaseUid && !user.firebaseUid.startsWith("local:") && user.firebaseUid !== decoded.uid) {
                return res.status(409).json({ message: "This email is linked to a different Google account." })
            }
            if (decoded.email_verified !== true) {
                return res.status(403).json({ message: "A verified Google email is required to link this account." })
            }
            user.firebaseUid = decoded.uid
            user.authProviders = [...new Set([...(user.authProviders || []), "google"])]
            if (!user.avatar && decoded.picture) user.avatar = decoded.picture
            await user.save()
        } else {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email,
                avatar: decoded.picture,
                authProviders: ["google"]
            })
        }
    }

    const sessionId = await createSession(user)
    res.cookie(getSessionCookieName(), sessionId, getSessionCookieOptions())
    return res.status(200).json(user)
}

const loginWithPassword = async ({ email, password }, res) => {
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." })
    }

    const { valid, normalizedEmail } = validateLogin({ email, password })
    if (!valid) return res.status(401).json({ message: "Invalid email or password." })

    const user = await User.findOne({ email: normalizedEmail }).select("+password")
    const passwordMatches = user?.password
        ? await comparePassword(password, user.password)
        : false

    if (!user || !passwordMatches) {
        return res.status(401).json({ message: "Invalid email or password." })
    }

    const sessionId = await createSession(user)
    res.cookie(getSessionCookieName(), sessionId, getSessionCookieOptions())
    return res.status(200).json(user)
}

export const login = async (req, res) => {
    try {
        const credentials = req.body || {}
        if (typeof credentials.token === "string" && credentials.token) {
            return await loginWithGoogle(credentials.token, res)
        }
        return await loginWithPassword(credentials, res)
    } catch (error) {
        console.error("Login error:", error.message)
        return res.status(500).json({ message: "Unable to sign in right now. Please try again." })
    }
}

export const register = async (req, res) => {
    try {
        const { errors, normalizedName, normalizedEmail } = validateRegistration(req.body || {})
        if (Object.keys(errors).length) {
            return res.status(400).json({ message: "Please check the registration details.", errors })
        }

        const existingUser = await User.findOne({ email: normalizedEmail }).select("_id")
        if (existingUser) {
            return res.status(409).json({ message: "An account with this email already exists. Try signing in." })
        }

        const password = await hashPassword(req.body.password)
        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            // Keep the existing non-sparse unique firebaseUid index compatible
            // with multiple local accounts until a separate index migration is made.
            firebaseUid: `local:${randomUUID()}`,
            password,
            authProviders: ["local"]
        })

        return res.status(201).json({
            message: "Account created. You can now sign in.",
            user
        })
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists. Try signing in." })
        }
        if (error?.name === "ValidationError") {
            return res.status(400).json({ message: "Please check the registration details." })
        }
        console.error("Registration error:", error.message)
        return res.status(500).json({ message: "Unable to create your account right now. Please try again." })
    }
}

export const getAuthenticatedUser = async (req, res) => {
    try {
        const user = await User.findById(req.authSession.userId)
        if (!user) return res.status(401).json({ message: "Your account is no longer available." })
        return res.status(200).json(user)
    } catch (error) {
        console.error("Get authenticated user error:", error.message)
        return res.status(500).json({ message: "Unable to load your account right now." })
    }
}

export const logOut = async (req, res) => {
    try {
        await invalidateSession(req)
        const { maxAge: _maxAge, ...clearOptions } = getSessionCookieOptions()
        res.clearCookie(getSessionCookieName(), clearOptions)
        return res.status(200).json({ message: "Signed out successfully." })
    } catch (error) {
        console.error("Logout error:", error.message)
        return res.status(500).json({ message: "Unable to sign out right now." })
    }
}
