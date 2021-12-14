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

  async findByUser(userId) {
    return await this.repo.find({
      where: {
        payment: {
          user: userId
        }
      }
    })

  }

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
