import {Test, TestingModule} from '@nestjs/testing';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MailerModule, MailerService} from "@nest-modules/mailer";
import {ConfigModule, ConfigService} from "nestjs-config";
import * as path from "path";
import {Payment} from "./entities/payment.entity";
import {TransactionService} from "../transaction/transaction.service";
import {StoresService} from "../stores/stores.service";
import {HttpService} from "@nestjs/axios";
import {PaymentService} from "./payment.service";
import {Transaction} from "../transaction/entities/transaction.entity";
import {Stores} from "../stores/entities/stores.entity";

const dotEnvPath = path.resolve(__dirname, '..', '.env');

describe('PaymentService',() => {
    let service: PaymentService;
    let mailerService: MailerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.load(
                    path.resolve(__dirname, 'config', '**!(*.d).config.{ts,js}'),
                    {
                        path: dotEnvPath,
                    },
                ), //ci
                TypeOrmModule.forRootAsync({
                    useFactory: (config: ConfigService) => {
                        return {
                            ...config.get('../config/database.config.ts'),
                            entities: [path.join(__dirname,'**', '*.entity.{ts,js}')],
                            keepConnectionAlive: true
                        };
                    },
                    inject: [ConfigService],
                }),
                TypeOrmModule.forFeature([Payment, Transaction, Stores]),
                MailerModule,
            ],
            providers: [
                PaymentService, TransactionService, StoresService,
                {
                    provide: MailerService,
                    useValue: {
                        get: jest.fn(async () => {
                        }),
                        // really it can be anything, but the closer to your actual logic the better
                    }
                },
                {
                    provide: HttpService,
                    useValue: {
                        get: jest.fn(async () => {
                        }),
                        // really it can be anything, but the closer to your actual logic the better
                    }
                },
            ],
        }).compile();

        service = module.get<PaymentService>(PaymentService);
        mailerService = module.get<MailerService>(MailerService);

        mailerService.sendMail = jest.fn();

    });
    it('should ', function () {
        expect("").toBeDefined();
    });


});