import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../db.js';

export const cartRouter = Router();

const itemSchema = z.object({
  token: z.string().optional(),
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().positive(),
});

function cartInclude() {
  return { items: true };
}

cartRouter.post('/', async (req, res, next) => {
  try {
    const input = itemSchema.parse(req.body);
    const token = input.token || crypto.randomUUID();
    const product = await prisma.product.findUnique({ where: { id: input.productId }, include: { variants: true } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const variant = input.variantId ? product.variants.find((item) => item.id === input.variantId) : null;
    const unitPrice = variant?.salePrice || variant?.regularPrice || product.salePrice || product.regularPrice;
    const cart = await prisma.cart.upsert({
      where: { token },
      update: {},
      create: { token },
    });
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: input.productId, variantId: input.variantId || null },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + input.quantity, unitPrice },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: input.productId, variantId: input.variantId || null, quantity: input.quantity, unitPrice },
      });
    }
    const saved = await prisma.cart.findUnique({ where: { token }, include: cartInclude() });
    res.json(saved);
  } catch (err) {
    next(err);
  }
});

cartRouter.patch('/items/:id', async (req, res, next) => {
  try {
    const quantity = z.object({ quantity: z.number().int().positive() }).parse(req.body).quantity;
    const item = await prisma.cartItem.update({ where: { id: Number(req.params.id) }, data: { quantity } });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

cartRouter.delete('/items/:id', async (req, res, next) => {
  try {
    await prisma.cartItem.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
