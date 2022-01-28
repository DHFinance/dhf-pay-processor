import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { HttpModule, HttpService } from "@nestjs/axios";
import { MailerService } from "@nest-modules/mailer";
import {Repository} from "typeorm";

@Injectable()
export class TransactionService {
  constructor(@InjectRepository(Transaction)
              private readonly repo: Repository<Transaction>, private httpService: HttpService, private mailerService: MailerService) {
  }

  async find(props) {
    return await this.repo.find(props)
  }

  /**
   * @description Отправка оповещений. После успеха транзакции, на почту указанную плательщиком при оплате, отправляется письмо с оповещением об изменении статуса.
   */
  async sendMail(transaction) {
    if (transaction.email) {
      await this.mailerService.sendMail({
        to: transaction.email,
        from: process.env.MAILER_EMAIL,
        subject: 'Transaction status changed',
        template: 'transaction-status-changed',
        context: {
          login: transaction.email,
          email: transaction.email,
          txHash: transaction.txHash,
          status: transaction.status,
        },
      });
    }
  }

  /**
   * @description Обновление транзакций. Каждую минуту все транзакции со статусом processing отправляют запрос на https://event-store-api-clarity-testnet.make.services/deploys/{transaction.txHash}, в ответ получают объект формата
   * {"data":{
   * "deployHash":"1c4E67848D6058FE85f3541C08d9B85f058959fb8C959Bf8A798235bc8614Bc5", - хэш транзакции
   * "blockHash":"6C51741Cd9Df2473d86ca81D6e1A2D1175171013C55715F7c85fFe7DB8Bc630d", - хэш блока
   * "account":"01a116eAe68beE00E558d57FC488f074E915b9Ba6533FC2423b04c78d0c9EF59D3", - публичный ключ отправителя
   * "cost":"100000000", - коммисия за транзакцию
   * "errorMessage":null, - ошибка транзакции
   * "timestamp":"2021-11-24T11:09:58.000Z", - время последнего изменения
   * "status":"executed" - статус транзакции
   * }}
   * если в ответе есть errorMessage - он записывается в поле status
   * если у транзакции появился blockHash и нет ошибки - значит что она прошла успешно и сохраняется со статусом success
   */
  async updateTransactions() {
    const transactions = await this.repo.find();
    const updateProcessingTransactions = await Promise.all(transactions.map(async (transaction) => {
      if (transaction.status === 'fake_processing') {
        const updatedTransaction = {
          ...transaction,
          status: 'fake_success',
          updated: new Date()
        }

        await this.sendMail(updatedTransaction)
        return updatedTransaction
      }
      if (transaction.status === 'processing') {
        const res = await this.httpService.get(`https://event-store-api-clarity-testnet.make.services/deploys/${transaction.txHash}`).toPromise();
        if (res.data.data.errorMessage) {
          const updatedTransaction = {
            ...transaction,
            status: res.data.data.errorMessage,
            updated: res.data.data.timestamp
          }
          await this.sendMail(updatedTransaction)
          return updatedTransaction
        }
        if (!res.data.data.errorMessage && res.data.data.blockHash) {
          const updatedTransaction = {
            ...transaction,
            status: 'success',
            updated: res.data.data.timestamp
          }
          await this.sendMail(updatedTransaction)
          return updatedTransaction
        }
      }
      return transaction
    }))

    await this.repo.save(updateProcessingTransactions)
  }


}
