import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../../common/constants';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password_hash: string;

  @ApiProperty()
  @Column()
  firstName: string;

  @ApiProperty()
  @Column()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Column({ nullable: true })
  verificationToken: string | null;

  @Exclude()
  @Column({ nullable: true })
  passwordResetToken: string | null;

  @Exclude()
  @Column({ nullable: true })
  passwordResetExpires: Date | null;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password_hash) {
      const salt = await bcrypt.genSalt();
      this.password_hash = await bcrypt.hash(this.password_hash, salt);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password_hash);
  }
}
