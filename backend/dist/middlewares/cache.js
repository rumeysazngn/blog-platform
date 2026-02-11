"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const redis_1 = require("../redis");
const cache = (keyBuilder, ttlSeconds = 60) => async (req, res, next) => {
    try {
        const key = keyBuilder(req);
        const cached = await redis_1.redis.get(key);
        if (cached) {
            return res.set('X-Cache', 'HIT').json(JSON.parse(cached));
        }
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // cache set
            redis_1.redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => { });
            res.set('X-Cache', 'MISS');
            return originalJson(body);
        };
        next();
    }
    catch (e) {
        next(); // cache hata verse bile API çalışsın
    }
};
exports.cache = cache;
