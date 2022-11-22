import { Casper } from './currencies/casper';
import { Doge } from './currencies/doge';
import { CurrencyType } from './currency.enum';

class CurrencyFabric {
  create(type: CurrencyType) {
    switch (type) {
      case CurrencyType.Bitcoin: {
        return new Casper();
      }
      case CurrencyType.Ethereum: {
        return new Casper();
      }
      case CurrencyType.Doge: {
        return new Doge();
      }
      case CurrencyType.USDT: {
        return new Casper();
      }
      case CurrencyType.Casper: {
        return new Casper();
      }
      default: {
        throw new Error('Currency type does not exist');
      }
    }
  }
}

export { CurrencyFabric };
