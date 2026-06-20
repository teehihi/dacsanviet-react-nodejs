import { Router } from 'express';
import { prisma } from '../db.js';
import { getFallbackContent, isDatabaseConnectionError, listFallbackPosts } from '../fallback-store.js';

export const contentRouter = Router();

contentRouter.get('/posts', async (_req, res, next) => {
  try {
    const posts = await prisma.contentPage.findMany({
      where: { type: 'post', published: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      const fallback = listFallbackPosts();
      if (fallback) return res.json(fallback);
    }
    next(err);
  }
});

contentRouter.get('/posts/:slug', async (req, res, next) => {
  try {
    const post = await prisma.contentPage.findUnique({ where: { slug: req.params.slug } });
    if (!post || post.type !== 'post' || !post.published) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      const fallback = getFallbackContent(req.params.slug, 'post');
      if (fallback) return res.json(fallback);
    }
    next(err);
  }
});

contentRouter.get('/content/:slug', async (req, res, next) => {
  try {
    const content = await prisma.contentPage.findUnique({ where: { slug: req.params.slug } });
    if (!content || !content.published) return res.status(404).json({ message: 'Content not found' });
    res.json(content);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      const fallback = getFallbackContent(req.params.slug);
      if (fallback) return res.json(fallback);
    }
    next(err);
  }
});

contentRouter.get('/pages/:slug', async (req, res, next) => {
  try {
    const page = await prisma.contentPage.findUnique({ where: { slug: req.params.slug } });
    if (!page || page.type !== 'page' || !page.published) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      const fallback = getFallbackContent(req.params.slug, 'page');
      if (fallback) return res.json(fallback);
    }
    next(err);
  }
});
