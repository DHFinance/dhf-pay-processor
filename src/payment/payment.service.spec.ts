import {MailerService} from "@nest-modules/mailer";
import {Payment} from "./entities/payment.entity";
import {TransactionService} from "../transaction/transaction.service";
import {StoresService} from "../stores/stores.service";
import {HttpService} from "@nestjs/axios";
import {PaymentService} from "./payment.service";
import {Transaction} from "../transaction/entities/transaction.entity";
import {Stores} from "../stores/entities/stores.entity";
import {HttpException} from "@nestjs/common";
import {Connection, Repository} from "typeorm";
import {User} from "../user/entities/user.entity";
import {createMemDB} from "../utils/createMemDB";


const nodemailerMock = require('nodemailer-mock');

const sendMail = jest.fn().mockImplementation(() => {
    return true;
});


describe('PaymentService', () => {
    let service: PaymentService;
    let db: Connection
    let transactionService: TransactionService
    let storesService: StoresService
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
        storesService = new StoresService(storesRepo)

        service = new PaymentService(paymentRepo,
            transactionService,
            storesService,
            mailerService,
            httpService);

        await Transaction.delete({})

    })

    afterAll(() => db.close())

    it('should create payment ', async () => {
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
        await storesRepo.save(store);

        const payment = {
            amount: 23000000000,
            comment: "",
            apiKey: store.apiKey,
            type: 2,
            text: "text333"
        }
        const createPayment = await service.create(payment);
        expect(createPayment).toHaveProperty("amount", payment.amount);
        await Payment.remove({...createPayment});
    });

    it('should get error for invalid apikey ', async () => {
        await expect(async () => {

            const payment = {
                amount: 23000000000,
                comment: "",
                apiKey: "PdXCEGLsfHhVYPTE4Hc2GR6AX0OYnnJU7UI2",
                type: 2,
                text: "text333"
            }

            await service.create({...payment, apiKey: payment.apiKey.slice(1, payment.apiKey.length)})
        }).rejects.toThrowError(HttpException);
    });

    it('should update a payment', async () => {

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

        await storesRepo.save(store);


        const payment = {
            amount: 23000000000,
            comment: "test comment",
            status: 'Not_paid',
            apiKey: store.apiKey,
            type: 2,
            text: "text333"
        }
        const newPayment = await service.create(payment);
        expect(newPayment).toHaveProperty("id")
        expect(newPayment.status).toEqual("Not_paid")

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

        await service.updateStatus();
        const paymentUpdated = await paymentRepo.findOne({
            where: {
                id: newPayment.id
            },
        });

        expect(paymentUpdated).toHaveProperty("id")
        expect(paymentUpdated.status).toEqual("Paid")


    })

    it('should get an exception if wrong connection', async () => {

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

        await storesRepo.save(store);


        const payment = {
            amount: 23000000000,
            comment: "test comment",
            status: 'Not_paid',
            apiKey: store.apiKey,
            type: 2,
            text: "text333"
        }
        const newPayment = await service.create(payment);
        expect(newPayment).toHaveProperty("id")
        expect(newPayment.status).toEqual("Not_paid")

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

        await service.updateStatus();

        httpService.get = jest.fn().mockImplementation(() => {
            throw Error('http err');
        });

        try {
            await transactionService.updateTransactions();
        }catch (e) {

            expect(e).toHaveProperty('message','http err')
        }



    })
});
