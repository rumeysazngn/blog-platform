"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("⛔ Token header yok!");
        return res.status(401).json({ message: "Token bulunamadı" });
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "super-secret-change-this";
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log("✅ JWT çözümü başarılı:", decoded);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role, // DOĞRU
        };
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ message: "Geçersiz token" });
    }
};
exports.authenticate = authenticate;
