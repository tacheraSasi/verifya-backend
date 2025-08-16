import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import { BasicEntity } from 'src/common/entities/base.entity';

@Entity('attendances')
export class Attendance extends BasicEntity {
  @ManyToOne(() => User, user => user.attendances, { nullable: false })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Office, office => office.attendances, { nullable: false })
  @JoinColumn()
  office: Office;

  @Column('decimal', { precision: 10, scale: 7 })
  checkinLatitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  checkinLongitude: number;

  @Column()
  checkinTime: Date;
}
