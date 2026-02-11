import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';

export const rateLimit =
  (limit = 100, windowSec = 60) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rl:${req.ip}`;
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, windowSec);
      }
      if (current > limit) {
        return res.status(429).json({ message: 'Too many requests' });
      }
      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - current)));
      next();
    } catch (e) {
      next();
    }
  };
