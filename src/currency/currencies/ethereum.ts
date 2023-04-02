import { HttpService } from '@nestjs/axios';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { Currency } from './currency';

class Ethereum extends Currency {
  async updateTransaction(transaction: Transaction) {
    const httpService = new HttpService();

    const res = await httpService
      .get(
        `https://event-store-api-clarity-testnet.make.services/deploys/${transaction.txHash}`,
      )
      .toPromise();
    if (res.data.data.errorMessage) {
      return {
        ...transaction,
        status: res.data.data.errorMessage,
        updated: res.data.data.timestamp,
      };
    }
    if (!res.data.data.errorMessage && res.data.data.blockHash) {
      return {
        ...transaction,
        status: 'success',
        updated: res.data.data.timestamp,
      };
    }
  }
}

export { Ethereum };
