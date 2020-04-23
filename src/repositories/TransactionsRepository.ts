import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface Request {
  transactions: Transaction[];
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance({ transactions }: Request): Promise<Balance> {
    const income = transactions.reduce(
      (total: number, transaction: Transaction) => {
        if (transaction.type === 'income') {
          const result = total + transaction.value;
          return result;
        }
        return total;
      },
      0,
    );

    const outcome = transactions.reduce(
      (total: number, transaction: Transaction) => {
        if (transaction.type === 'outcome') {
          const result = total + transaction.value;
          return result;
        }
        return total;
      },
      0,
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
