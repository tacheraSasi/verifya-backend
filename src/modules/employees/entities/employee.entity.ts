import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Office } from 'src/modules/offices/entities/office.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true, cascade: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Office, office => office.users)
  office: Office;

  // Phone number for invitation
  phoneNumber: string;

  // OTP for verification
  otp: string;

  // OTP expiration
  otpExpires: Date;
}
