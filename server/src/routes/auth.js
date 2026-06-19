import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'development-secret', {
      expiresIn: '7d',
    });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});
