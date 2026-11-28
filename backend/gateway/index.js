
import "dotenv/config"
import express from "express";
import Proxy from "express-http-proxy";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { getCurrentUser } from "./controllers/user.controller.js";
import protect from "./middleware/auth.middleware.js";
import { proxyWithHeader } from "./utils/proxyWithHeader.js";

const port = process.env.PORT;
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }));

app.use(morgan("dev"));
app.use(cookieParser());

// Existing authentication routes
app.use("/api/auth", Proxy(process.env.AUTH_SERVICE, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        // The auth service uses the gateway-observed address for rate limiting.
        proxyReqOpts.headers["x-client-ip"] = srcReq.ip;
        return proxyReqOpts;
    }
}));

// Generated PDF and PPT files
// Forward requests to the agent service (port 8003)
app.use(
    "/generated",
    Proxy(process.env.AGENT_SERVICE, {
        proxyReqPathResolver: (req) => `/generated${req.url}`
    })
);

// Existing chat routes
app.use(
    "/api/chat",
    protect,
    proxyWithHeader(process.env.CHAT_SERVICE)
);

// Existing agent routes
app.use(
    "/api/agent",
    protect,
    Proxy(process.env.AGENT_SERVICE)
);

// Current user route
app.get("/api/me", protect, getCurrentUser);

app.get("/", (req, res) => {
    res.json({
        message: "hey buddy im gateway"
    });
});

app.listen(port, () => {
    console.log(`gateway started at ${port}`);
});
