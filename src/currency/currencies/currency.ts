import { Transaction } from '../../transaction/entities/transaction.entity';

abstract class Currency {
  abstract updateTransaction(transaction: Transaction);
}

export { Currency };
