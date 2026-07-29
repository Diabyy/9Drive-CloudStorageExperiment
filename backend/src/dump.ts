import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      connectedAccounts: {
        select: {
          id: true,
          userId: true,
          accountEmail: true,
          accountName: true,
          provider: true,
          totalQuotaBytes: true,
          usedQuotaBytes: true,
          rootDriveFolderId: true,
          isActive: true,
          createdAt: true,
        },
      },
      virtualFolders: true,
    },
  });

  const files = await prisma.virtualFile.findMany({
    select: {
      id: true,
      userId: true,
      connectedAccountId: true,
      originalName: true,
      mimeType: true,
      sizeBytes: true,
      driveFileId: true,
      folderId: true,
      createdAt: true,
    },
  });

  const folders = await prisma.virtualFolder.findMany();

  console.log('--------------------------------------------------');
  console.log('👥 USERS & CONNECTED ACCOUNTS:');
  console.log(JSON.stringify(users, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

  console.log('\n--------------------------------------------------');
  console.log('📁 VIRTUAL FOLDERS:');
  console.log(JSON.stringify(folders, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));

  console.log('\n--------------------------------------------------');
  console.log('📄 VIRTUAL FILES:');
  console.log(JSON.stringify(files, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
