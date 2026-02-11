"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = __importDefault(require("./routes"));
const path_1 = __importDefault(require("path"));
const error_1 = require("./middlewares/error");
const rateLimit_1 = require("./middlewares/rateLimit");
require("./db"); // PostgreSQL ve Redis bağlantısı burada yapılıyor
const app = (0, express_1.default)();
/**
 *  Global Middleware'lar
 */
app.use((0, rateLimit_1.rateLimit)(200, 60)); // dakika başına 200 istek
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // 👈 önemli kısım
}));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // frontend adresin
    credentials: true, // cookie veya auth header'ı taşımak için
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, morgan_1.default)("dev"));
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.cwd(), "uploads")));
/**
 * 🏠 Root endpoint
 */
app.get("/", (_req, res) => {
    res.send(`
    <h1>📝 Blog Platformu API Çalışıyor 🚀</h1>
    <p>Sağlık kontrolü için <a href="/api/health">/api/health</a> adresine gidin.</p>
  `);
});
/**
 * ❤️ Health Check endpoint
 */
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
});
/**
 * 🧩 API Routes
 * Tüm backend route’ları buradan başlar
 */
app.use("/api", routes_1.default);
/**
 * ⚠️ 404 handler (tanımsız route’lar için)
 */
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Endpoint bulunamadı" });
});
/**
 * 🧱 Global Error Handler
 */
app.use(error_1.errorHandler);
/**
 * 🚀 App export
 */
console.log("WORKING DIR:", process.cwd());
console.log("UPLOAD PATH:", path_1.default.resolve(process.cwd(), "uploads"));
exports.default = app;
