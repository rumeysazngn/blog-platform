import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes";
import path from "path";
import { errorHandler } from "./middlewares/error";
import { rateLimit } from "./middlewares/rateLimit";
import "./db"; // PostgreSQL ve Redis bağlantısı burada yapılıyor

const app = express();

/**
 *  Global Middleware'lar
 */
app.use(rateLimit(200, 60)); // dakika başına 200 istek
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // 👈 önemli kısım
  })
);
app.use(
  cors({
    origin: "http://localhost:5173", // frontend adresin
    credentials: true, // cookie veya auth header'ı taşımak için
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));


/**
 * 🏠 Root endpoint
 */
app.get("/", (_req: Request, res: Response) => {
  res.send(`
    <h1>📝 Blog Platformu API Çalışıyor 🚀</h1>
    <p>Sağlık kontrolü için <a href="/api/health">/api/health</a> adresine gidin.</p>
  `);
});

/**
 * ❤️ Health Check endpoint
 */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

/**
 * 🧩 API Routes
 * Tüm backend route’ları buradan başlar
 */
app.use("/api", routes);

/**
 * ⚠️ 404 handler (tanımsız route’lar için)
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Endpoint bulunamadı" });
});

/**
 * 🧱 Global Error Handler
 */
app.use(errorHandler);

/**
 * 🚀 App export
 */
console.log("WORKING DIR:", process.cwd());
console.log("UPLOAD PATH:", path.resolve(process.cwd(), "uploads"));

export default app;
