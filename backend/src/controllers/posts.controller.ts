import { Request, Response, NextFunction } from 'express';
import { postsService } from '../services/posts.service';

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await postsService.list();
    res.json(data);
  } catch (e) { next(e); }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await postsService.getById(Number(req.params.id));
    if (!data) return res.status(404).json({ message: 'Post not found' });
    res.json(data);
  } catch (e) { next(e); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await postsService.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await postsService.update(Number(req.params.id), req.body);
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await postsService.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};
