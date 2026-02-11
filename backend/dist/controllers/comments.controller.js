"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.create = exports.list = void 0;
const db_1 = require("../db");
// Yorumları listele
const list = async (_req, res, next) => {
    try {
        const { rows } = await (0, db_1.query)(`SELECT yorum_id, yazi_id, yazar_id, yorum_icerigi, olusturma_tarihi
       FROM yorumlar
       ORDER BY olusturma_tarihi DESC`);
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
};
exports.list = list;
// Yeni yorum oluştur
const create = async (req, res, next) => {
    try {
        const { yazi_id, yazar_id, yorum_icerigi } = req.body;
        const { rows } = await (0, db_1.query)(`INSERT INTO yorumlar (yazi_id, yazar_id, yorum_icerigi, olusturma_tarihi)
       VALUES ($1, $2, $3, NOW())
       RETURNING yorum_id, yazi_id, yazar_id, yorum_icerigi, olusturma_tarihi`, [yazi_id, yazar_id, yorum_icerigi]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        next(err);
    }
};
exports.create = create;
// Yorum sil
const remove = async (req, res, next) => {
    try {
        const yorumId = Number(req.params.id);
        await (0, db_1.query)('DELETE FROM yorumlar WHERE yorum_id = $1', [yorumId]);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.remove = remove;
