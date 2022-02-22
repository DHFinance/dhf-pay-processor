import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Payment } from "./entities/payment.entity";
import { Interval } from "@nestjs/schedule";
import { TransactionService } from "../transaction/transaction.service";
import { MailerService } from "@nest-modules/mailer";
import {Repository} from "typeorm";
import {StoresService} from "../stores/stores.service";
import {HttpService} from "@nestjs/axios";

@Injectable()
export class PaymentService {
  constructor(@InjectRepository(Payment)
              private readonly repo: Repository<Payment>,
              private readonly transactionService: TransactionService,
              private readonly storesService: StoresService,
              private mailerService: MailerService,
              private httpService: HttpService
  ) {
  }

  /**
   * @description Создание платежа. Магазин привязывается по полученному apiKey, дата последнего изменения выставляется текущая, статус платежа при создании всегда Not_paid
   */
  async create(payment) {
    try {
      const store = await this.storesService.findStore(payment.apiKey)
      console.log(store.id);
      if (store) {
        const newPayment =  await this.repo.save({...payment, status: 'Not_paid', datetime: new Date(), store})
        return newPayment
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * @description Send alerts. After successful payment of the payment, an email is sent to the owner of the store to which the payment is linked with a status change notification. Payment data is also sent via a post request to the callback url specified when creating the store.
   */
  async sendMail(payment, email) {
    console.log(payment.store.url)
    try {
      const successCallback = await this.httpService.post(payment.store.url, payment).toPromise();
      console.log(successCallback.data)
    } catch (e) {
      console.log('post callback Error', e)

    }
    await this.mailerService.sendMail({
      to:  email,
      from: process.env.MAILER_EMAIL,
      subject: 'Payment status changed',
      template: 'payment-status-changed',
      context: {
        login: email,
        email: email,
        status: payment.status,
      },
    });

  }

  /**
   * @description Transactions and payments are updated every minute. First, the transaction status is updated. Every minute all payment records with status Particularly_paid or Not_paid are checked. If the amount of successful transactions carried out on these payments is greater than or equal to the amount of the payment, its status changes to Paid, and a status change letter is sent to the owner of the store that owns the payment
   */
  @Interval(60000)
  async updateStatus() {
    console.log('status updated')
    await this.transactionService.updateTransactions()
    const payments = await this.repo.find({
      relations: ['store'],
    });
    console.log({payments})
    try {
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

        const getTransactionsTotal = () => {
          let counter = 0
          transactions.forEach((transaction, i) => {
            counter += +transaction.amount
          })
          return counter
        }

        if (payment.status !== 'Paid') {
          if (getTransactionsTotal() >= +payment.amount) {
            const store = await this.storesService.findOne({
              where: {
                id: payment.store.id
              },
              relations: ['user'],
            });
            payment.status = 'Paid'
            await this.sendMail(payment, store.user.email)
            return payment
          }
          if (getTransactionsTotal() !== +payment.amount && getTransactionsTotal() > 0) {
            const store = await this.storesService.findOne({
              where: {
                id: payment.store.id
              },
              relations: ['user'],
            });
            payment.status = 'Particularly_paid'
            await this.sendMail(payment, store.user.email)
            return payment
          }
        }
        return payment
      }))
      console.log({updatedPayments})
      await this.repo.save(updatedPayments)
    } catch (e) {
      console.log('other error: ', e)
    }
  }
}
