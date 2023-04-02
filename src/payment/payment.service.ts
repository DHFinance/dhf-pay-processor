import { MailerService } from '@nest-modules/mailer';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoresService } from '../stores/stores.service';
import { TransactionService } from '../transaction/transaction.service';
import { Payment, Status } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly repo: Repository<Payment>,
    private readonly transactionService: TransactionService,
    private readonly storesService: StoresService,
    private mailerService: MailerService,
    private httpService: HttpService,
  ) {}

  /**
   * @description Создание платежа. Магазин привязывается по полученному apiKey, дата последнего изменения выставляется текущая, статус платежа при создании всегда Not_paid
   */
  async create(payment) {
    try {
      const store = await this.storesService.findStore(payment.apiKey);
      if (store) {
        const newPayment = await this.repo.save({
          ...payment,
          status: 'Not_paid',
          datetime: new Date(),
          store,
        });
        return newPayment;
      }
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * @description Send alerts. After successful payment of the payment, an email is sent to the owner of the store to which the payment is linked with a status change notification. Payment data is also sent via a post request to the callback url specified when creating the store.
   */
  async sendMail(payment, email) {
    try {
      const successCallback = await this.httpService
        .post(payment.store.url, payment)
        .toPromise();
    } catch (e) {
      console.log('post callback Error', e);
    }
    await this.mailerService.sendMail({
      to: email,
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
    await this.transactionService.updateTransactions();
    const payments = await this.repo.find({
      where: {
        status: 'Not_paid',
      },
      relations: ['store', 'store.user'],
    });

    try {
      const updatedPayments = await Promise.all(
        payments.map(async (payment) => {
          const casperTransactions = await this.transactionService.find({
            where: {
              payment: payment,
              status: 'success',
            },
          });
          const fakeTransactions = await this.transactionService.find({
            where: {
              payment: payment,
              status: 'fake_success',
            },
          });

          const transactions = [...fakeTransactions, ...casperTransactions];

          const getTransactionsTotal = () => {
            let counter = 0;
            transactions.forEach((transaction, i) => {
              counter += +transaction.amount;
            });
            return counter;
          };

          if (getTransactionsTotal() >= +payment.amount) {
            payment.status = Status.Paid;
            try {
              await this.sendMail(payment, payment.store.user.email);
            } catch (e) {
              console.log(e);
            }
            return payment;
          }
          if (
            getTransactionsTotal() !== +payment.amount &&
            getTransactionsTotal() > 0
          ) {
            payment.status = Status.Particularly_paid;
            try {
              await this.sendMail(payment, payment.store.user.email);
            } catch (e) {
              console.log(e);
            }
            return payment;
          }
          return payment;
        }),
      );

      await this.repo.save(updatedPayments);
    } catch (e) {
      console.log('other error: ', e);
    }
  }
}
