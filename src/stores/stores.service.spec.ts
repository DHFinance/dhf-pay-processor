import {Test, TestingModule} from '@nestjs/testing';
import {TypeOrmModule} from "@nestjs/typeorm";
import {MailerModule, MailerService} from "@nest-modules/mailer";
import {ConfigModule, ConfigService} from "nestjs-config";
import * as path from "path";
import {StoresService} from "../stores/stores.service";
import {HttpService} from "@nestjs/axios";
import {Stores} from "../stores/entities/stores.entity";
import {HttpException} from "@nestjs/common";

const dotEnvPath = path.resolve(__dirname, '..', '.env');

const apiKey = "PdXCEGLsfHhVYPTE4Hc2GR6AX0OYnnJU7UI2";

describe('StoresService',() => {
    let service: StoresService;
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
                TypeOrmModule.forFeature([Stores]),
                MailerModule,
            ],
            providers: [
                StoresService,
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

        service = module.get<StoresService>(StoresService);
        mailerService = module.get<MailerService>(MailerService);

        mailerService.sendMail = jest.fn();

    });
    it('should find store ',  async () => {
        const store = await service.findStore(apiKey);
       expect(store).toHaveProperty("apiKey", apiKey);
    });

    it('should get error for invalid apikey ',async () => {
        await expect(async ()=>{
            await service.findStore(apiKey.slice(1,apiKey.length))
        }).rejects.toThrowError(HttpException);
    });

});