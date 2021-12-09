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

  @EventPattern('createOne')
  async createOne(data: any) {
    console.log({data})
    await this.paymentService.create(data).then(payment => {
      console.log({payment})
      return payment.id
    }).catch((err) => {
      console.log({err})
      return new HttpException(err.response, HttpStatus.BAD_REQUEST);
    })
  }

}

