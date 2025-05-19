import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import * as crypto from 'crypto';
import { Office } from 'src/entities/office.entity';
import { Attendance } from 'src/entities/attendance.entity';

export enum UserRole {
  ADMIN = 'admin',
  EMPLOYEE = 'employee',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  userRole: UserRole;

  @ManyToOne(() => Role, role => role.users, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => Office, office => office.users, { nullable: false })
  @JoinColumn({ name: 'officeId' })
  office: Office;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @OneToMany(() => Attendance, attendance => attendance.user)
  attendances: Attendance[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordBeforeInsertOrUpdate() {
    if (this.password && !this.password.includes(':')) {
      this.password = await this.#hashPassword(this.password);
    }
  }
  async #hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(salt + ':' + derivedKey.toString('hex'));
      });
    });
  }

  async verifyPassword(plainTextPassword: string): Promise<boolean> {
    const [salt, storedHash] = this.password.split(':');
    return new Promise((resolve, reject) => {
      crypto.scrypt(plainTextPassword, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        resolve(storedHash === derivedKey.toString('hex'));
      });
    });
  }
}
