import {Connection, Repository} from 'typeorm'
import {TransactionService} from './transaction.service';
import {HttpService} from "@nestjs/axios";
import {MailerService} from "@nest-modules/mailer";
import {createMemDB} from "../utils/createMemDB";
import {Transaction} from "./entities/transaction.entity";
import {Stores} from "../stores/entities/stores.entity";
import {User} from "../user/entities/user.entity";
import {Payment} from "../payment/entities/payment.entity";
import fn = jest.fn;

const nodemailerMock = require('nodemailer-mock');

const sendMail = jest.fn().mockImplementation(() => {
    return true;
});

describe('Transaction Service', () => {
    let db: Connection
    let transactionService: TransactionService
    //  let storesService: StoresService
    let transactionRepo: Repository<Transaction>
    let storesRepo: Repository<Stores>
    let httpService: HttpService
    let mailerService: MailerService
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

        await Transaction.delete({})

    })

    afterAll(() => db.close())

    it('should update a transaction', async () => {

        const user = {
            name: "1",
            lastName: "1",
            email: "mail@gmail.com",
            token: "$2b$07$PUx7RK/NjXwo7i9xpYT2vejPjU3A4hxCCvYYkDbZ/fcfgyFnCw9f.",
            role: 'customer',
            // id: 60,
            password: "5ZlEqFyVD4XMnxJsSFZf2Yra1k3m44o1E59v",
            company: "mail.ru",
            blocked: false,
        };


        const newUser = await userRepo.save(user);


        const store = {
            name: "Store test",
            description: "Good store",
            url: "https://lms.sfedu.ru/my/",
            apiKey: "FL1f0BNoBB3qRQ4dKtzwNgmdT95qJniM89Ak123",
            user: newUser,
            wallet: "01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9",
            blocked: false
        }

        const newStore = await storesRepo.save(store);

        const payment = {
            amount: "2500000000",
            status: "Not_paid",
            comment: "test comment"

        }

        const newPayment = await paymentRepo.save({...payment, status: 'Not_paid', datetime: new Date(), newStore});


        const transaction = {
            "status": "fake_processing",
            "email": "ermachenkovvova@gmail.com",
            "txHash": "16ae42729a88a4df9519a8e08807d68856070d93cf162898948b7de57e1a3368",
            "sender": "01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9",
            "amount": "1213",
            "payment": newPayment,
        }

        const newTransaction = await transactionRepo.save({
            ...transaction,
            amount: newPayment.amount,
            updated: new Date()
        })

        expect(newTransaction).toHaveProperty("id")
        expect(newTransaction.status).toEqual("fake_processing")
        expect(newTransaction.email).toEqual("ermachenkovvova@gmail.com")
        expect(newTransaction.txHash).toEqual("16ae42729a88a4df9519a8e08807d68856070d93cf162898948b7de57e1a3368")
        expect(newTransaction.sender).toEqual("01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9");


        await transactionService.updateTransactions();

        const fakeTransactions = await transactionService.find({
            where: {
                id: newTransaction.id,

            }
        });

        const updatedTransaction = fakeTransactions[0];

        expect(updatedTransaction).toHaveProperty("id")
        expect(updatedTransaction.status).toEqual("fake_success")
        expect(updatedTransaction.email).toEqual("ermachenkovvova@gmail.com")
        expect(updatedTransaction.txHash).toEqual("16ae42729a88a4df9519a8e08807d68856070d93cf162898948b7de57e1a3368")


    })


    it('don`t change data if got an exception', async () => {

        const user = {
            name: "1",
            lastName: "1",
            email: "mail@gmail.com",
            token: "$2b$07$PUx7RK/NjXwo7i9xpYT2vejPjU3A4hxCCvYYkDbZ/fcfgyFnCw9f.",
            role: 'customer',
            // id: 60,
            password: "5ZlEqFyVD4XMnxJsSFZf2Yra1k3m44o1E59v",
            company: "mail.ru",
            blocked: false,
        };


        const newUser = await userRepo.save(user);


        const store = {
            name: "Store test",
            description: "Good store",
            url: "https://lms.sfedu.ru/my/",
            apiKey: "FL1f0BNoBB3qRQ4dKtzwNgmdT95qJniM89Ak123",
            user: newUser,
            wallet: "01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9",
            blocked: false
        }

        const newStore = await storesRepo.save(store);

        const payment = {
            amount: "2500000000",
            status: "Not_paid",
            comment: "test comment"

        }

        const newPayment = await paymentRepo.save({...payment, status: 'Not_paid', datetime: new Date(), newStore});


        const transaction = {
            "status": "processing",
            "email": "ermachenkovvova@gmail.com",
            "txHash": "16ae42729a88a4df9519a8e08807d68856070d93cf162898948b7de57e1a3368",
            "sender": "01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9",
            "amount": "1213",
            "payment": newPayment,
        }

        const newTransaction = await transactionRepo.save({
            ...transaction,
            amount: newPayment.amount,
            updated: new Date()
        })

        expect(newTransaction).toHaveProperty("id")
        expect(newTransaction.status).toEqual("processing")
        expect(newTransaction.email).toEqual("ermachenkovvova@gmail.com")
        expect(newTransaction.txHash).toEqual("16ae42729a88a4df9519a8e08807d68856070d93cf162898948b7de57e1a3368")
        expect(newTransaction.sender).toEqual("01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9");


        httpService.get = jest.fn().mockImplementation(() => {
            throw Error('http err');
        });

        try {
            await transactionService.updateTransactions();
        }catch (e) {

            expect(e).toHaveProperty('message','http err')
        }




        const fakeTransactions = await transactionService.find({
            where: {
                id: newTransaction.id,

            }
        });

        const updatedTransaction = fakeTransactions[0];

        expect(updatedTransaction.status).toEqual("processing")
        expect(updatedTransaction.email).toEqual("ermachenkovvova@gmail.com")
        expect(updatedTransaction.txHash).toEqual("16ae42729a88a4df9519a8e08807d68856070d93cf162898948b7de57e1a3368")
        expect(updatedTransaction.sender).toEqual("01acdbbd933fd7aaedb7b1bd29c577027d86b5fafc422267a89fc386b7ebf420c9");

    })


})
