import { Currency } from './currency';
import * as BlockIO from 'block_io';

class Doge extends Currency {
  constructor() {
    super();
  }

  async updateTransaction(transaction) {
    const client = new BlockIO('b5b1-5b2d-4889-efb4');

    return {
      ...transaction,
      status: 'success',
      updated: new Date(),
    };
  }
}

export { Doge };
