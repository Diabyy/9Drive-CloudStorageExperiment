import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function selectTargetStorageAccount(userId: string, fileSize: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      connectedAccounts: {
        where: { isActive: true },
        orderBy: { priorityOrder: 'asc' },
      },
    },
  });

  if (!user || user.connectedAccounts.length === 0) {
    throw new Error('No active connected storage accounts available. Please connect a Google Drive account first.');
  }

  const policy = user.routingPolicy;
  const accounts = user.connectedAccounts;

  if (policy === 'MOST_AVAILABLE') {
    // Select account with maximum remaining free space
    const sorted = [...accounts].sort((a, b) => {
      const freeA = BigInt(a.totalQuotaBytes) - BigInt(a.usedQuotaBytes);
      const freeB = BigInt(b.totalQuotaBytes) - BigInt(b.usedQuotaBytes);
      return freeB > freeA ? 1 : freeB < freeA ? -1 : 0;
    });
    return sorted[0];
  }

  if (policy === 'PRIORITY_ORDER') {
    // Select first account that has enough free space for the file
    for (const acc of accounts) {
      const freeBytes = BigInt(acc.totalQuotaBytes) - BigInt(acc.usedQuotaBytes);
      if (freeBytes >= BigInt(fileSize)) {
        return acc;
      }
    }
    return accounts[0];
  }

  // Default / Round-Robin: Pick randomly or first
  return accounts[Math.floor(Math.random() * accounts.length)];
}
