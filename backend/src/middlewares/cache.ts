import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';

export const cache =
  (keyBuilder: (req: Request) => string, ttlSeconds = 60) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = keyBuilder(req);
      const cached = await redis.get(key);
      if (cached) {
        return res.set('X-Cache', 'HIT').json(JSON.parse(cached));
      }
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // cache set
        redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {});
        res.set('X-Cache', 'MISS');
        return originalJson(body);
      };
      next();
    } catch (e) {
      next(); // cache hata verse bile API çalışsın
    }
  };
