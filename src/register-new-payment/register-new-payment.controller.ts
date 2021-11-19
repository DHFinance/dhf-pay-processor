import { Controller } from '@nestjs/common';
import {EventPattern} from "@nestjs/microservices";

@Controller('register-new-payment')
export class RegisterNewPaymentController {

    @EventPattern('hello')
    async hello(data: string) {
        console.log(data)
    }
}
