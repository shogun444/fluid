import prisma from "../utils/db";

export interface TransactionRecord {
  hash: string;
  status: 'pending' | 'submitted' | 'success' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

class TransactionStore {
  async addTransaction(hash: string, status: 'pending' | 'submitted'): Promise<void> {
    await prisma.transaction.upsert({
      where: { hash },
      update: { status },
      create: { hash, status },
    });
    console.log(`[TransactionStore] Added transaction ${hash} with status ${status}`);
  }

  async updateTransactionStatus(hash: string, status: 'success' | 'failed'): Promise<void> {
    try {
      await prisma.transaction.update({ where: { hash }, data: { status } });
      console.log(`[TransactionStore] Updated transaction ${hash} to status ${status}`);
    } catch {
      console.log(`[TransactionStore] Transaction ${hash} not found for status update`);
    }
  }

  async getPendingTransactions(): Promise<TransactionRecord[]> {
    const pending = await prisma.transaction.findMany({
      where: { status: { in: ['pending', 'submitted'] } },
    });
    console.log(`[TransactionStore] Found ${pending.length} pending/submitted transactions`);
    return pending as TransactionRecord[];
  }

  async getTransaction(hash: string): Promise<TransactionRecord | null> {
    const record = await prisma.transaction.findUnique({ where: { hash } });
    return record as TransactionRecord | null;
  }

  async getAllTransactions(): Promise<TransactionRecord[]> {
    const records = await prisma.transaction.findMany();
    return records as TransactionRecord[];
  }
}

export const transactionStore = new TransactionStore();
