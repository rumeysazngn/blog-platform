import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

// Yorumları listele
export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await query(
      `SELECT yorum_id, yazi_id, yazar_id, yorum_icerigi, olusturma_tarihi
       FROM yorumlar
       ORDER BY olusturma_tarihi DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Yeni yorum oluştur
export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { yazi_id, yazar_id, yorum_icerigi } = req.body;

    const { rows } = await query(
      `INSERT INTO yorumlar (yazi_id, yazar_id, yorum_icerigi, olusturma_tarihi)
       VALUES ($1, $2, $3, NOW())
       RETURNING yorum_id, yazi_id, yazar_id, yorum_icerigi, olusturma_tarihi`,
      [yazi_id, yazar_id, yorum_icerigi]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// Yorum sil
export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const yorumId = Number(req.params.id);
    await query('DELETE FROM yorumlar WHERE yorum_id = $1', [yorumId]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
