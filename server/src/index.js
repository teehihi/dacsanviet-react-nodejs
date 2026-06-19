import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from './db.js';
import { authRouter } from './routes/auth.js';
import { productRouter } from './routes/products.js';
import { categoryRouter } from './routes/categories.js';
import { cartRouter } from './routes/cart.js';
import { orderRouter } from './routes/orders.js';
import { contentRouter } from './routes/content.js';
import { adminRouter } from './routes/admin.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/assets', express.static(path.resolve(__dirname, '../../client/public/assets')));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'dsv-api' }));
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api', contentRouter);
app.use('/api/admin', adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`DSV API listening on http://localhost:${port}`);
});
