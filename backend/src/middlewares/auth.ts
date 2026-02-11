import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("⛔ Token header yok!");
    return res.status(401).json({ message: "Token bulunamadı" });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "super-secret-change-this";

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log("✅ JWT çözümü başarılı:", decoded);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,      // DOĞRU

    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Geçersiz token" });
  }
};
