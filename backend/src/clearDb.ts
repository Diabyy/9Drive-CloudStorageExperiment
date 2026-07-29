import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all records from database...');

  await prisma.virtualFile.deleteMany({});
  await prisma.virtualFolder.deleteMany({});
  await prisma.connectedAccount.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Database successfully reset and cleared!');
}

main()
  .catch((e) => console.error('Failed to clear database:', e))
  .finally(() => prisma.$disconnect());
