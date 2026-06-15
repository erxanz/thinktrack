import { PrismaPg } from "@prisma/adapter-pg";
// PERBAIKAN: Hapus "/client" di bagian paling belakang
import { PrismaClient } from "@/app/generated/prisma"; 

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Catatan: Jika ada error di bagian adapter, pastikan Anda juga 
  // menggunakan import { Pool } from 'pg' sesuai dokumentasi Prisma adapter-pg
  const adapter = new PrismaPg({ connectionString } as any); 

  return new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;