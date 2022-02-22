import {Controller} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import {EventPattern} from "@nestjs/microservices";

@Controller('payment')
export class PaymentController {
  constructor(
    public readonly paymentService: PaymentService
  ) {}

  /**
   * @description controller receives data from dhf-pay-back and creates a payment based on it. Returns the id of the created payment
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

