import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Stores } from "./entities/stores.entity";

@Injectable()
export class StoresService extends TypeOrmCrudService<Stores> {
  constructor(@InjectRepository(Stores) repo
  ) {
    super(repo);
  }

  async findStore(apiKey) {
    console.log({apiKey})
    const store = this.repo.findOne({
      where: {
        apiKey
      }
    })
    console.log({store})
    if (store) {
      return store
    }
    throw new HttpException('store with this API not exist', HttpStatus.BAD_REQUEST);
  }
}
