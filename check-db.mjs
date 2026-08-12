import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();
const prisma = new PrismaClient();
const products = await prisma.product.findMany({ select: { id: true, name: true, image: true, category: true } });
console.log(JSON.stringify(products, null, 2));
await prisma.$disconnect();
