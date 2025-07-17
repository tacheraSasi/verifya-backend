import { Entity, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Attendance } from 'src/modules/attendances/entities/attendance.entity';
import { BasicEntity } from 'src/common/entities/base.entity';

@Entity('offices')
export class Office extends BasicEntity {
  @Column()
  name: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  latitude: number | null;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 7 })
  longitude: number | null;

  @Column({ nullable: false })
  phoneNumber: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  admin: User;

  @OneToMany(() => User, user => user.office)
  users: User[];

  @OneToMany(() => Attendance, attendance => attendance.office)
  attendances: Attendance[];
}
