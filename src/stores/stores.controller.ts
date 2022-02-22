import { Controller } from "@nestjs/common";
import {Crud, CrudController} from '@nestjsx/crud';
import { StoresService } from "./stores.service";
import { Stores } from "./entities/stores.entity";

@Crud({
  model: {
    type: Stores,
  },
  query: {
    join: {
      user: {
        eager: true,
      },
      transaction: {
        eager: true,
      },
    },
  },
})

@Controller('store')
export class StoresController implements CrudController<Stores> {
  constructor(
      public readonly service: StoresService,

  ) {}



}

