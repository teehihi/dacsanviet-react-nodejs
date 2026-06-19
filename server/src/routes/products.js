import { Router } from 'express';
import { prisma } from '../db.js';

export const productRouter = Router();

const includeProduct = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' } },
  variants: true,
};

function productWhere(query) {
  const where = { status: 'ACTIVE' };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { shortDescription: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }
  if (query.category) where.category = { slug: query.category };
  if (query.featured === 'true') where.featured = true;
  return where;
}

function orderBy(sort) {
  if (sort === 'price_asc') return { salePrice: 'asc' };
  if (sort === 'price_desc') return { salePrice: 'desc' };
  if (sort === 'oldest') return { createdAt: 'asc' };
  return { createdAt: 'desc' };
}

productRouter.get('/', async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 60);
    const where = productWhere(req.query);
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: includeProduct,
        orderBy: orderBy(req.query.sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
});

productRouter.get('/:slug', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: includeProduct,
    });
    if (!product || product.status !== 'ACTIVE') return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});
