"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getById = exports.list = void 0;
const db_1 = require("../db");
// tüm kullanıcıları listele
const list = async (_req, res, next) => {
    try {
        const { rows } = await (0, db_1.query)('SELECT kullanici_id, kullanici_adi, email FROM kullanicilar ORDER BY kullanici_id DESC');
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
};
exports.list = list;
// belirli bir kullanıcı getir
const getById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { rows } = await (0, db_1.query)('SELECT kullanici_id, kullanici_adi, email FROM kullanicilar WHERE kullanici_id = $1', [id]);
        if (rows.length === 0)
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
};
exports.getById = getById;
// kullanıcı oluştur
const create = async (req, res, next) => {
    try {
        const { kullanici_adi, email, sifre } = req.body;
        const { rows } = await (0, db_1.query)('INSERT INTO kullanicilar (kullanici_adi, email, sifre, olusturma_tarihi) VALUES ($1,$2,$3,NOW()) RETURNING kullanici_id, kullanici_adi, email', [kullanici_adi, email, sifre]);
        res.status(201).json(rows[0]);
    }
    catch (err) {
        next(err);
    }
};
exports.create = create;
// kullanıcı güncelle
const update = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { kullanici_adi, email } = req.body;
        const { rows } = await (0, db_1.query)('UPDATE kullanicilar SET kullanici_adi = COALESCE($2, kullanici_adi), email = COALESCE($3, email) WHERE kullanici_id = $1 RETURNING kullanici_id, kullanici_adi, email', [id, kullanici_adi, email]);
        if (rows.length === 0)
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
};
exports.update = update;
// kullanıcı sil
const remove = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        await (0, db_1.query)('DELETE FROM kullanicilar WHERE kullanici_id = $1', [id]);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.remove = remove;
