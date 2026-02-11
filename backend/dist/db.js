"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.pool = void 0;
const pg_1 = require("pg");
const config_1 = require("./config");
exports.pool = new pg_1.Pool(config_1.config.db);
// PostgreSQL bağlantı kontrolü
exports.pool.on('connect', () => {
    console.log('🐘 PostgreSQL connected');
});
exports.pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});
// basit helper
const query = (text, params) => exports.pool.query(text, params);
exports.query = query;
