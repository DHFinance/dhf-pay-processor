import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from '../../payment/entities/payment.entity';

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  updated: Date;

  @Column({ nullable: true })
  txHash: string;

  @ManyToOne(() => Payment, (payment) => payment, {
    eager: true,
  })
  payment: Payment;

  @Column({ nullable: true })
  sender: string;

  @Column({ type: 'bigint' })
  amount: string;

  @Column({ nullable: true })
  walletForTransaction: string;
}
