import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';

export const orderRouter = Router();

const orderSchema = z.object({
  customer: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(8),
    email: z.string().email().optional().or(z.literal('')),
    line1: z.string().min(5),
    ward: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
    note: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    variantId: z.number().int().positive().optional().nullable(),
    quantity: z.number().int().positive(),
  })).min(1),
  paymentMethod: z.enum(['COD', 'QR_TRANSFER']).default('COD'),
});

function orderCode() {
  return `DSV${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
}

orderRouter.post('/', async (req, res, next) => {
  try {
    const input = orderSchema.parse(req.body);
    const products = await prisma.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) } },
      include: { variants: true },
    });
    const items = input.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) throw Object.assign(new Error('Product not found'), { status: 404 });
      const variant = item.variantId ? product.variants.find((entry) => entry.id === item.variantId) : null;
      const unitPrice = Number(variant?.salePrice || variant?.regularPrice || product.salePrice || product.regularPrice);
      return {
        product,
        variant,
        quantity: item.quantity,
        unitPrice,
        total: unitPrice * item.quantity,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shippingFee = subtotal >= 300000 ? 0 : 30000;
    const total = subtotal + shippingFee;
    const address = await prisma.address.create({ data: input.customer });
    const order = await prisma.order.create({
      data: {
        code: orderCode(),
        addressId: address.id,
        subtotal,
        shippingFee,
        total,
        items: {
          create: items.map((item) => ({
            productId: item.product.id,
            variantName: item.variant?.name,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
        payment: {
          create: {
            method: input.paymentMethod,
            status: input.paymentMethod === 'COD' ? 'UNPAID' : 'PENDING',
            qrContent: input.paymentMethod === 'QR_TRANSFER' ? `DSV ${Date.now()} ${input.customer.phone}` : null,
          },
        },
      },
      include: { address: true, items: true, payment: true },
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});
