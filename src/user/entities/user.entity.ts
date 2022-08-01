import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({nullable: true})
  restorePasswordCode: number;

  @Column({nullable: true})
  emailVerification: number;

  @Column()
  email: string;

  @Column()
  role: string;//'admin' | 'customer';

  @Column()
  company: string;

  @Column()
  token: string;

  @Column()
  blocked: boolean;

  @Column()
  loginAttempts: number

  @CreateDateColumn({nullable: true})
  timeBlockLogin: Date
}
