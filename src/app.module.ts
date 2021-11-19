import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RegisterNewPaymentModule } from './register-new-payment/register-new-payment.module';
import { ParseTransactionDataModule } from './parse-transaction-data/parse-transaction-data.module';

@Module({
  imports: [RegisterNewPaymentModule, ParseTransactionDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
