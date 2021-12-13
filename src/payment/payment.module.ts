import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TransactionModule } from "../transaction/transaction.module";
import {StoresModule} from "../stores/stores.module";

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), TransactionModule, StoresModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [],
})
export class PaymentModule {}
