"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriber = exports.publisher = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("./config");
exports.publisher = new ioredis_1.default(config_1.config.redisUrl);
exports.subscriber = new ioredis_1.default(config_1.config.redisUrl);
// örnek abonelik (ayrı bir process de olabilir)
exports.subscriber.subscribe('post_published');
exports.subscriber.on('message', (channel, message) => {
    if (channel === 'post_published') {
        console.log('📣 Yeni yazı yayınlandı:', message);
        // burada skor hesaplama, öneri tetikleme vs.
    }
});
