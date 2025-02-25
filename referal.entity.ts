import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.referredUsers)
  referrer: User;

  @ManyToOne(() => User)
  referredUser: User;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'successful'

  @CreateDateColumn()
  dateReferred: Date;
}
