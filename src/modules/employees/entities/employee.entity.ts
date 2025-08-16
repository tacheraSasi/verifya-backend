import { Entity, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';
import { BasicEntity } from 'src/common/entities/base.entity';

@Entity('employees')
export class Employee extends BasicEntity {
  @OneToOne(() => User, { eager: true, cascade: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Office, office => office.users)
  office: Office;

  // Phone number for invitation
  phoneNumber: string;
}
