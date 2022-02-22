import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm";
import { Payment } from "../../payment/entities/payment.entity";

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  email: string;

  @Column()
  updated: Date;

  @Column()
  txHash: string;

  @ManyToOne(() => Payment, payment => payment)
  payment: Payment;

  @Column()
  sender: string;

  @Column({type: 'bigint'})
  amount: string;
}
