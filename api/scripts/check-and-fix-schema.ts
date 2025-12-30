import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking for duplicate sessionIds...');

  // 1. 重複チェック
  const duplicates = await prisma.$runCommandRaw({
    aggregate: 'conversations',
    pipeline: [
      { $group: { _id: '$sessionId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ],
    cursor: {},
  });

  const dupes = (duplicates as any).cursor.firstBatch;

  if (dupes.length === 0) {
    console.log('✓ No duplicates found - safe to apply schema');
    console.log('\nYou can now run: pnpm prisma db push');
    return;
  }

  // 2. 重複修正
  console.log(`Found ${dupes.length} duplicate sessionIds, fixing...\n`);

  for (const dup of dupes) {
    const sessionId = dup._id;
    const conversations = await prisma.conversation.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`  SessionId "${sessionId}" has ${conversations.length} conversations`);

    // 最古以外に新しいUUID割り当て
    for (let i = 1; i < conversations.length; i++) {
      const newSessionId = randomUUID();
      await prisma.conversation.update({
        where: { id: conversations[i].id },
        data: { sessionId: newSessionId },
      });
      console.log(`    Updated conversation ${conversations[i].id} to ${newSessionId}`);
    }
  }

  console.log('\n✓ Duplicates fixed - now run: pnpm prisma db push');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
