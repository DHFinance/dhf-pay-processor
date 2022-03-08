import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from './user.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {MailerModule, MailerService} from "@nest-modules/mailer";
import {ConfigModule, ConfigService} from "nestjs-config";
import * as path from "path";
import {Connection, Repository} from "typeorm";
import {TransactionService} from "../transaction/transaction.service";
import {Transaction} from "../transaction/entities/transaction.entity";
import {Stores} from "../stores/entities/stores.entity";
import {HttpService} from "@nestjs/axios";
import {Payment} from "../payment/entities/payment.entity";
import {createMemDB} from "../utils/createMemDB";


const nodemailerMock = require('nodemailer-mock');

const sendMail = jest.fn().mockImplementation(() => {
  return true;
});


const dotEnvPath = path.resolve(__dirname, '..', '.env');

const user = {
  name:"1",
  lastName:"1",
  email:"mail@gmail.com",
  role:"customer",
  password:"5ZlEqFyVD4XMnxJsSFZf2Yra1k3m44o1E59v",
  company:"mail.ru",
  blocked: false
};

describe('UserService',() => {
  let service: UserService;
  let mailerService: MailerService;
  let db: Connection
  let transactionService: TransactionService
  //  let storesService: StoresService
  let transactionRepo: Repository<Transaction>
  let storesRepo: Repository<Stores>
  let httpService: HttpService
  let paymentRepo: Repository<Payment>
  let userRepo: Repository<User>

  beforeAll(async () => {
    const transport = nodemailerMock.createTransport({
      host: '127.0.0.1',
      port: -100,
    });

    db = await createMemDB([Transaction, Stores, User, Payment])
    transactionRepo = await db.getRepository(Transaction)
    storesRepo = await db.getRepository(Stores)
    // storesService = new StoresService(storesRepo)
    paymentRepo = await db.getRepository(Payment)
    userRepo = await db.getRepository(User)

    httpService = new HttpService();
    mailerService = new MailerService({
      transport: transport

    })

    mailerService.sendMail = sendMail.bind(mailerService)


    transactionService = new TransactionService(transactionRepo, httpService, mailerService)


    service = new UserService(userRepo, mailerService);


    await Transaction.delete({})

  })

  afterAll(() => db.close())

  it('should created user',  async () => {
   const createdUser = await service.create({ ...user });
   expect(createdUser).toHaveProperty("email","mail@gmail.com");
  });

  it('should get error the same users', async () => {
   const foundedUser = await service.findByEmail(user.email);
   if (foundedUser) await expect(async ()=> await service.create({ ...foundedUser })).rejects.toThrow();
  });

  it('should get error at verifying user', async () => {
   await expect(async () => await service.verifyUser({email:user.email, code:5454})).rejects.toThrow();
  });

  it('find user by email',async () => {
   const foundedUser = await service.findByEmail(user.email);
   expect(foundedUser).toHaveProperty("email",user.email);

  });

});
