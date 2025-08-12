import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  code: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}
