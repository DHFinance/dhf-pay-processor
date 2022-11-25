import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CurrencyType } from '../../currency/currency.enum';
import { Stores } from '../../stores/entities/stores.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';

export enum Status {
  Not_paid = 'Not_paid',
  Paid = 'Paid',
  Particularly_paid = 'Particularly_paid',
}

@Entity()
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Stores, (store) => store, {
    eager: true,
  })
  store: Stores;

  @OneToMany(() => Transaction, (transactions) => transactions.payment)
  transactions: Transaction[];

  @CreateDateColumn()
  datetime: Date;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ default: 'Not_paid' })
  status: Status;

  @Column({ nullable: true })
  comment: string;

  @Column({ nullable: true })
  type: number;

  @Column({ nullable: true })
  text: string;

  @Column({ default: false })
  cancelled: boolean;

  @Column({ enum: CurrencyType, default: CurrencyType.Casper })
  currency: CurrencyType;
}
