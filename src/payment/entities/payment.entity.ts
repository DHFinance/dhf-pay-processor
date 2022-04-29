import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne, OneToMany
} from "typeorm";
import { Transaction } from "../../transaction/entities/transaction.entity";
import {Stores} from "../../stores/entities/stores.entity";

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Stores, store => store)
  store: Stores;

  @OneToMany(() => Transaction, (transactions) => transactions.payment)
  transactions: Transaction[];

  @Column()
  datetime: Date;

  @Column({type: 'bigint'})
  amount: string;

  @Column()
  status: 'Not_paid' | 'Particularly_paid' | 'Paid';

  @Column({nullable: true})
  comment: string;

  @Column({nullable: true})
  type: number;

  @Column({nullable: true})
  text: string;

  @Column({nullable: false})
  cancelled: boolean
}
