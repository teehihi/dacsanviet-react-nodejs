import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/db.js';

const email = process.env.ADMIN_EMAIL || 'admin@dacsanviet.site';
const password = process.env.ADMIN_PASSWORD || 'Admin@12345';

async function main() {
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN', name: 'Đặc Sản Việt Admin' },
    create: { email, passwordHash, role: 'ADMIN', name: 'Đặc Sản Việt Admin' },
  });
  console.log(`Admin ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
