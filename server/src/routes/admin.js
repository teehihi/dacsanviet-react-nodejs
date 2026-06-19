import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  regularPrice: z.coerce.number().nonnegative(),
  salePrice: z.coerce.number().nonnegative().optional().nullable(),
  stockQuantity: z.coerce.number().int().nonnegative().default(0),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  featured: z.boolean().default(false),
  categoryId: z.number().int().positive().optional().nullable(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional(), sortOrder: z.number().optional() })).default([]),
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  parentId: z.number().int().positive().optional().nullable(),
});

adminRouter.get('/products', async (_req, res, next) => {
  try {
    res.json(await prisma.product.findMany({ include: { category: true, images: true, variants: true }, orderBy: { updatedAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/products', async (req, res, next) => {
  try {
    const input = productSchema.parse(req.body);
    const product = await prisma.product.create({
      data: {
        ...input,
        slug: input.slug || slugify(input.name, { lower: true, strict: true, locale: 'vi' }),
        images: { create: input.images },
      },
      include: { images: true },
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/products/:id', async (req, res, next) => {
  try {
    const input = productSchema.partial().parse(req.body);
    const images = input.images;
    delete input.images;
    const id = Number(req.params.id);
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      input.images = { create: images };
    }
    const product = await prisma.product.update({ where: { id }, data: input, include: { images: true, variants: true } });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    await prisma.product.update({ where: { id: Number(req.params.id) }, data: { status: 'ARCHIVED' } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/categories', async (_req, res, next) => {
  try {
    res.json(await prisma.category.findMany({ orderBy: { name: 'asc' } }));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/categories', async (req, res, next) => {
  try {
    const input = categorySchema.parse(req.body);
    const category = await prisma.category.create({
      data: { ...input, slug: input.slug || slugify(input.name, { lower: true, strict: true, locale: 'vi' }) },
    });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/categories/:id', async (req, res, next) => {
  try {
    const input = categorySchema.partial().parse(req.body);
    res.json(await prisma.category.update({ where: { id: Number(req.params.id) }, data: input }));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/orders', async (_req, res, next) => {
  try {
    res.json(await prisma.order.findMany({ include: { address: true, items: true, payment: true }, orderBy: { createdAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/orders/:id', async (req, res, next) => {
  try {
    const status = z.object({ status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED']) }).parse(req.body).status;
    res.json(await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status }, include: { address: true, items: true, payment: true } }));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', async (_req, res, next) => {
  try {
    res.json(await prisma.user.findMany({ select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true } }));
  } catch (err) {
    next(err);
  }
});
