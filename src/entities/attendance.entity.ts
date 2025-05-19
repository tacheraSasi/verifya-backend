import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Office } from './office.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.attendances, { nullable: false })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Office, (office) => office.attendances, { nullable: false })
  @JoinColumn()
  office: Office;

  @Column('decimal', { precision: 10, scale: 7 })
  checkinLatitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  checkinLongitude: number;

  @Column()
  checkinTime: Date;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  checkoutLatitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  checkoutLongitude: number;

  @Column({ nullable: true })
  checkoutTime: Date;

  @CreateDateColumn()
  createdAt: Date;
}