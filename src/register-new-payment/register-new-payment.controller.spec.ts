import { Test, TestingModule } from '@nestjs/testing';
import { RegisterNewPaymentController } from './register-new-payment.controller';

describe('RegisterNewPaymentController', () => {
  let controller: RegisterNewPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegisterNewPaymentController],
    }).compile();

    controller = module.get<RegisterNewPaymentController>(RegisterNewPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
