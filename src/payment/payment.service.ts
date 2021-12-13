import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Interval } from "@nestjs/schedule";
import { Transaction } from "../transaction/entities/transaction.entity";
import { TransactionService } from "../transaction/transaction.service";
import { MailerService } from "@nest-modules/mailer";
import {Repository} from "typeorm";
import {StoresService} from "../stores/stores.service";

@Injectable()
export class PaymentService {
  constructor(@InjectRepository(Payment)
              private readonly repo: Repository<Payment>,
              private readonly transactionService: TransactionService,
              private readonly storesService: StoresService,
              private mailerService: MailerService
  ) {
  }

  async create(payment) {
    console.log({dto: payment})
    try {
      const store = await this.storesService.findStore(payment.apiKey)
      console.log({store})
      if (store) {
        const newPayment =  await this.repo.save({...payment, store})
        console.log({newPayment})
        return newPayment
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async findByUser(userId) {
    const userPayments = this.repo.find({
      where: {
        user: userId
      }
    })
    return userPayments
  }

  async sendMail(payment) {

    await this.mailerService.sendMail({
      to:  payment.store.user.email,
      from: process.env.MAILER_EMAIL,
      subject: 'Payment status changed',
      template: 'payment-status-changed',
      context: {
        login: payment.store.user.email,
        email: payment.store.user.email,
        status: payment.status,
      },
    });
  }

  @Interval(60000)
  async updateStatus() {
    await this.transactionService.updateTransactions()
    const payments = await this.repo.find({
      relations: ['store'],
    });
    const updatedPayments = await Promise.all(payments.map(async (payment) => {
      const casperTransactions = await this.transactionService.find({
        where: {
          payment: payment,
          status: 'success'
        }
      });
      const fakeTransactions = await this.transactionService.find({
        where: {
          payment: payment,
          status: 'fake_success'
        }
      });

      const transactions = [...fakeTransactions, ...casperTransactions]

      console.log(transactions)

      const getTransactionsTotal = () => {
        let counter = 0
        transactions.forEach((transaction, i) => {
          counter += +transaction.amount
        })
        return counter
      }



      if (payment.status !== 'Paid') {
        console.log(getTransactionsTotal() >= +payment.amount, getTransactionsTotal(), +payment.amount)
        if (getTransactionsTotal() >= +payment.amount) {
          payment.status = 'Paid'
          await this.sendMail(payment)
          console.log(payment)
          return payment
        }
        if (getTransactionsTotal() !== +payment.amount && getTransactionsTotal() > 0) {
          payment.status = 'Particularly_paid'
          await this.sendMail(payment)
          return payment
        }
      }
      return payment
    }))
    await this.repo.save(updatedPayments)
  }
}
