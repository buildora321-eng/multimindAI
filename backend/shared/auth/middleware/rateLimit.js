import { createHash } from "node:crypto";
import redis from "../../redis/redis.js";
import { normalizeEmail } from "../validators/auth.validator.js";

const WINDOW_SECONDS = 15 * 60;
const IP_LIMIT = 50;
const EMAIL_LIMIT = 10;

const digest = (value) => createHash("sha256").update(String(value || "unknown")).digest("hex");

const incrementWindow = async (key) => {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, WINDOW_SECONDS);
    return count;
};

export const manualAuthRateLimit = async (req, res, next) => {
    // Preserve the existing Firebase sign-in flow and rate-limit only manual auth.
    if (typeof req.body?.token === "string" && req.body.token) return next();

    try {
        const ip = req.headers["x-client-ip"] || req.ip || "unknown";
        const email = normalizeEmail(req.body?.email);
        const ipCount = await incrementWindow(`auth-limit:ip:${digest(ip)}`);
        const emailCount = email
            ? await incrementWindow(`auth-limit:email:${digest(email)}`)
            : 0;

        if (ipCount > IP_LIMIT || emailCount > EMAIL_LIMIT) {
            res.set("Retry-After", String(WINDOW_SECONDS));
            return res.status(429).json({ message: "Too many authentication attempts. Please try again later." });
        }
        return next();
    } catch (error) {
        console.error("Authentication rate limiter error:", error.message);
        return res.status(503).json({ message: "Authentication is temporarily unavailable." });
    }
};
