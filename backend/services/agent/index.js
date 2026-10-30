
import express from "express";
import dotenv from "dotenv";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import connectDb from "./config/db.js";
import router from "./routes/agent.route.js";

dotenv.config();

const port = process.env.PORT || 8003;

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());

// Serve generated PDF files
app.use(
    "/generated",
    express.static(path.join(__dirname, "generated"))
);

// Routes
app.use("/", router);

app.get("/", (req, res) => {
    res.json({ message: "hey buddy i'm agent" });
});

app.listen(port, () => {
    console.log(`agent started at ${port}`);
    connectDb();
});
