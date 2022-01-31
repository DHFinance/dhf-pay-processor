import {Controller, Get, HttpException, HttpStatus, Inject, Post} from "@nestjs/common";
import {
  Crud,
  CrudController,
  Override,
  CrudRequest,
  ParsedRequest,
  ParsedBody,
  CreateManyDto,
} from '@nestjsx/crud';
import { Payment } from "./entities/payment.entity";
import { PaymentService } from "./payment.service";
import {ClientProxy, EventPattern} from "@nestjs/microservices";

@Controller('payment')
export class PaymentController {
  constructor(
    public readonly paymentService: PaymentService
  ) {}

  /**
   * @description controller получает данные с dhf-pay-back и на их основе создает payment. Возвращает id созданного payment
   * @data {amount: {number}, comment: {string}, apiKey: {string}}
   * @return id: {number}
   */
  @EventPattern('createOne')
  async createOne(data: any) {
    console.log(data)
    const payment = await this.paymentService.create(data)
    return payment.id
  }

}

