import { Module } from '@nestjs/common';
import { RegisterNewPaymentController } from './register-new-payment.controller';

@Module({
  controllers: [RegisterNewPaymentController],
  imports: []
})
export class RegisterNewPaymentModule {}
