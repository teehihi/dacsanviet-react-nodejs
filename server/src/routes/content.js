import { Router } from 'express';
import { prisma } from '../db.js';

export const contentRouter = Router();

contentRouter.get('/posts', async (_req, res, next) => {
  try {
    const posts = await prisma.contentPage.findMany({
      where: { type: 'post', published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

contentRouter.get('/pages/:slug', async (req, res, next) => {
  try {
    const page = await prisma.contentPage.findUnique({ where: { slug: req.params.slug } });
    if (!page || page.type !== 'page' || !page.published) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    next(err);
  }
});
