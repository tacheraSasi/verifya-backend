import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Attendance } from 'src/entities/attendance.entity';

@Entity('offices')
export class Office {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  admin: User;

  @OneToMany(() => User, user => user.office)
  users: User[];

  @OneToMany(() => Attendance, attendance => attendance.office)
  attendances: Attendance[];
}
