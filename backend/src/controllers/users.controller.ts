import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

// tüm kullanıcıları listele
export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query('SELECT kullanici_id, kullanici_adi, email FROM kullanicilar ORDER BY kullanici_id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// belirli bir kullanıcı getir
export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await query('SELECT kullanici_id, kullanici_adi, email FROM kullanicilar WHERE kullanici_id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// kullanıcı oluştur
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { kullanici_adi, email, sifre } = req.body;
    const { rows } = await query(
      'INSERT INTO kullanicilar (kullanici_adi, email, sifre, olusturma_tarihi) VALUES ($1,$2,$3,NOW()) RETURNING kullanici_id, kullanici_adi, email',
      [kullanici_adi, email, sifre]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// kullanıcı güncelle
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { kullanici_adi, email } = req.body;
    const { rows } = await query(
      'UPDATE kullanicilar SET kullanici_adi = COALESCE($2, kullanici_adi), email = COALESCE($3, email) WHERE kullanici_id = $1 RETURNING kullanici_id, kullanici_adi, email',
      [id, kullanici_adi, email]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// kullanıcı sil
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await query('DELETE FROM kullanicilar WHERE kullanici_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
