import { Router } from 'express';
import slugify from 'slugify';
import { z } from 'zod';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { prisma } from '../db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../../../client/public/assets/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fileUrl = `/assets/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

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

const postSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  excerpt: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  published: z.boolean().default(true),
  featured: z.boolean().optional(),
});

adminRouter.get('/dashboard', async (_req, res, next) => {
  try {
    const [
      productCount,
      categoryCount,
      postCount,
      userCount,
      orderCount,
      revenue,
      orders,
      products,
      posts,
    ] = await Promise.all([
      prisma.product.count({ where: { status: { not: 'ARCHIVED' } } }),
      prisma.category.count(),
      prisma.contentPage.count({ where: { type: 'post' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.findMany({
        include: { address: true, items: true, payment: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.product.findMany({
        where: { status: { not: 'ARCHIVED' } },
        include: { category: true, images: true, orderItems: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
      prisma.contentPage.findMany({ where: { type: 'post' }, orderBy: { createdAt: 'desc' } }),
    ]);

    const topProducts = products
      .map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category?.name,
        image: product.images?.[0]?.url,
        price: Number(product.salePrice || product.regularPrice || 0),
        sold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      }))
      .sort((a, b) => b.sold - a.sold || b.price - a.price)
      .slice(0, 5);

    const now = new Date();
    const revenueTrend = Array.from({ length: 30 }, (_, index) => {
      const day = new Date(now);
      day.setDate(now.getDate() - (29 - index));
      const key = day.toISOString().slice(0, 10);
      const value = orders
        .filter((order) => order.createdAt.toISOString().slice(0, 10) === key)
        .reduce((sum, order) => sum + Number(order.total || 0), 0);
      return { date: key, revenue: value };
    });

    res.json({
      metrics: {
        products: productCount,
        categories: categoryCount,
        posts: postCount,
        customers: userCount,
        orders: orderCount,
        revenue: Number(revenue._sum.total || 0),
        averageOrder: orderCount ? Number(revenue._sum.total || 0) / orderCount : 0,
      },
      revenueTrend,
      topProducts,
      recentOrders: orders,
      postStats: {
        total: postCount,
        published: posts.filter((post) => post.published).length,
        drafts: posts.filter((post) => !post.published).length,
      },
    });
  } catch (err) {
    next(err);
  }
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
    const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
    res.json(categories.map((category) => ({ ...category, productCount: category._count.products, _count: undefined })));
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
    const input = z.object({
      status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED']).optional(),
      paymentStatus: z.enum(['UNPAID', 'PENDING', 'PAID', 'FAILED']).optional(),
    }).parse(req.body);
    if (input.paymentStatus) {
      await prisma.payment.updateMany({ where: { orderId: Number(req.params.id) }, data: { status: input.paymentStatus } });
    }
    res.json(await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: input.status ? { status: input.status } : {},
      include: { address: true, items: true, payment: true },
    }));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true, orders: { select: { total: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users.map((user) => ({
      ...user,
      orderCount: user.orders.length,
      totalSpent: user.orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      orders: undefined,
    })));
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/posts', async (_req, res, next) => {
  try {
    res.json(await prisma.contentPage.findMany({ where: { type: 'post' }, orderBy: { updatedAt: 'desc' } }));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/posts', async (req, res, next) => {
  try {
    const input = postSchema.parse(req.body);
    const post = await prisma.contentPage.create({
      data: {
        type: 'post',
        title: input.title,
        slug: input.slug || slugify(input.title, { lower: true, strict: true, locale: 'vi' }),
        excerpt: input.excerpt,
        body: input.body,
        imageUrl: input.imageUrl,
        published: input.published,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/posts/:id', async (req, res, next) => {
  try {
    const input = postSchema.partial().parse(req.body);
    const data = {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
    };
    res.json(await prisma.contentPage.update({ where: { id: Number(req.params.id) }, data }));
  } catch (err) {
    next(err);
  }
});

adminRouter.delete('/posts/:id', async (req, res, next) => {
  try {
    await prisma.contentPage.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
