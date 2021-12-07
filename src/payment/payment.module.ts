import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ClientsModule, Transport } from "@nestjs/microservices";
import { TransactionModule } from "../transaction/transaction.module";

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), TransactionModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [],
})
export class PaymentModule {}
