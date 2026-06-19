import { Router } from 'express';
import { prisma } from '../db.js';

export const categoryRouter = Router();

categoryRouter.get('/', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true, _count: { select: { products: true } } },
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});
