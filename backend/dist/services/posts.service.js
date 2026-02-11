"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsService = void 0;
const db_1 = require("../db");
const redisPubSub_1 = require("../redisPubSub");
exports.postsService = {
    async list() {
        const sql = `
      SELECT yazi_id, baslik, alt_baslik, yazar_id, kategori_id, yayinlanma_tarihi
      FROM yazilar
      ORDER BY yayinlanma_tarihi DESC
      LIMIT 50`;
        const { rows } = await (0, db_1.query)(sql);
        return rows;
    },
    async getById(id) {
        const sql = `SELECT * FROM yazilar WHERE yazi_id = $1`;
        const { rows } = await (0, db_1.query)(sql, [id]);
        return rows[0];
    },
    async create(data) {
        const sql = `
      INSERT INTO yazilar (yazar_id, kategori_id, baslik, alt_baslik, içerik, kapak_resmi, yayinlanma_tarihi)
      VALUES ($1,$2,$3,$4,$5,$6, NOW())
      RETURNING *`;
        const params = [data.yazar_id, data.kategori_id, data.baslik, data.alt_baslik, data.içerik, data.kapak_resmi];
        const { rows } = await (0, db_1.query)(sql, params);
        const created = rows[0];
        redisPubSub_1.publisher.publish('post_published', JSON.stringify({ yazi_id: created.yazi_id }));
        return created;
    },
    async update(id, data) {
        const sql = `
      UPDATE yazilar
      SET baslik = COALESCE($2, baslik),
          alt_baslik = COALESCE($3, alt_baslik),
          içerik = COALESCE($4, içerik),
          kapak_resmi = COALESCE($5, kapak_resmi),
          güncellenme_tarihi = NOW()
      WHERE yazi_id = $1
      RETURNING *`;
        const params = [id, data.baslik, data.alt_baslik, data.içerik, data.kapak_resmi];
        const { rows } = await (0, db_1.query)(sql, params);
        return rows[0];
    },
    async remove(id) {
        await (0, db_1.query)(`DELETE FROM yazilar WHERE yazi_id = $1`, [id]);
    }
};
