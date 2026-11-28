import { randomUUID } from "node:crypto";
import redis from "../redis/redis.js";

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
export const getSessionCookieName = () => process.env.COOKIE_NAME || "session";

export const getSessionCookieOptions = () => {
    const sameSite = (process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === "production" ? "none" : "lax")).toLowerCase();
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || sameSite === "none",
        sameSite,
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
        maxAge: SESSION_TTL_SECONDS * 1000
    };
};

export const createSession = async (user) => {
    const sessionId = randomUUID();
    const session = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || null
    };
    await redis.set(`session-${sessionId}`, JSON.stringify(session), "EX", SESSION_TTL_SECONDS);
    return sessionId;
};

const readCookie = (header, name) => {
    for (const item of (header || "").split(";")) {
        const separator = item.indexOf("=");
        if (separator < 0 || item.slice(0, separator).trim() !== name) continue;
        const value = item.slice(separator + 1).trim();
        try { return decodeURIComponent(value); } catch { return value; }
    }
    return null;
};

export const getSessionId = (req) =>
    req.cookies?.[getSessionCookieName()] || readCookie(req.headers.cookie, getSessionCookieName());

export const invalidateSession = async (req) => {
    const sessionId = getSessionId(req);
    if (sessionId) await redis.del(`session-${sessionId}`);
};

export const requireSession = async (req, res, next) => {
    try {
        const sessionId = getSessionId(req);
        if (!sessionId) return res.status(401).json({ message: "Authentication required." });

        const rawSession = await redis.get(`session-${sessionId}`);
        if (!rawSession) return res.status(401).json({ message: "Your session has expired. Please sign in again." });

        req.authSession = JSON.parse(rawSession);
        return next();
    } catch (error) {
        console.error("Session validation error:", error.message);
        return res.status(500).json({ message: "Unable to validate your session." });
    }
};
