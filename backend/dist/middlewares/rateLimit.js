"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = void 0;
const redis_1 = require("../redis");
const rateLimit = (limit = 100, windowSec = 60) => async (req, res, next) => {
    try {
        const key = `rl:${req.ip}`;
        const current = await redis_1.redis.incr(key);
        if (current === 1) {
            await redis_1.redis.expire(key, windowSec);
        }
        if (current > limit) {
            return res.status(429).json({ message: 'Too many requests' });
        }
        res.setHeader('X-RateLimit-Limit', String(limit));
        res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - current)));
        next();
    }
    catch (e) {
        next();
    }
};
exports.rateLimit = rateLimit;
