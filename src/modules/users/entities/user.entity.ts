import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEmailConfirmation } from './user-email-confirmation.entity';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UserProfileEntity } from './user-profile.entity';
import { UserPasswordRecoveryEntity } from './user-password-recovery.entity';
import { InternalServerErrorException } from '@nestjs/common';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  email: string;
  @Column()
  login: string;
  @Column()
  passwordHash: string;
  @Column()
  password: string;

  @OneToOne(() => UserEmailConfirmation, (emailConfirm) => emailConfirm.user, {
    cascade: true,
  })
  emailConfirmation: UserEmailConfirmation;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user, {
    cascade: true,
  })
  profile: UserProfileEntity;

  @OneToOne(() => UserPasswordRecoveryEntity, (password) => password.user, {
    cascade: true,
  })
  passwordRecovery: UserPasswordRecoveryEntity;

  isEmailCanBeConfirmed(code: string): boolean {
    if (this.emailConfirmation.isConfirmed) return false;
    if (this.emailConfirmation.confirmationCode !== code) return false;
    if (this.emailConfirmation.expirationDate < new Date()) return false;
    return true;
  }

  confirmEmail(code: string) {
    if (!this.isEmailCanBeConfirmed(code)) throw new Error('cant be confirmed');
    this.emailConfirmation.isConfirmed = true;
  }

  updateConfirmationCode(): void {
    this.emailConfirmation.confirmationCode = randomUUID();
    this.emailConfirmation.expirationDate = add(new Date(), { hours: 1 });
  }

  updatePasswordHash(passwordHash: string, passwordRecoveryCode: string): void {
    if (!this.isNewPasswordCanBeSet(passwordRecoveryCode)) {
      throw new InternalServerErrorException("This password hash can't be set");
    }
    this.passwordHash = passwordHash;
  }

  isNewPasswordCanBeSet(recoveryCode: string): boolean {
    if (this.passwordRecovery.isCodeAlreadyUsed) return false;
    if (this.passwordRecovery.recoveryCode !== recoveryCode) return false;
    if (this.passwordRecovery.expirationDate < new Date()) return false;
    return true;
  }

  makePasswordRecoveryCodeUsed() {
    this.passwordRecovery.isCodeAlreadyUsed = true;
  }

  createPasswordRecovery(): string {
    const passwordRecovery = new UserPasswordRecoveryEntity();
    passwordRecovery.isCodeAlreadyUsed = false;
    passwordRecovery.user = this;
    passwordRecovery.recoveryCode = randomUUID();
    passwordRecovery.expirationDate = add(new Date(), { hours: 1 });

    this.passwordRecovery = passwordRecovery;
    return passwordRecovery.recoveryCode;
  }

  createEmailConfirmation(): UserEmailConfirmation {
    const emailConfirmation = new UserEmailConfirmation();
    emailConfirmation.user = this;
    emailConfirmation.confirmationCode = randomUUID();
    emailConfirmation.isConfirmed = false;
    emailConfirmation.expirationDate = add(new Date(), { hours: 1 });

    this.emailConfirmation = emailConfirmation;

    return emailConfirmation;
  }

  createProfile(): UserProfileEntity {
    const profile = new UserProfileEntity();

    profile.user = this;
    this.profile = profile;

    return profile;
  }

  static create(
    dto: {
      login: string;
      email: string;
      password: string;
      passwordHash: string;
    },
    createEmailConfirmation = true
  ): UserEntity {
    const user = new UserEntity();
    user.login = dto.login;
    user.email = dto.email;
    user.password = dto.password;
    user.passwordHash = dto.password;

    if (createEmailConfirmation) {
      user.createEmailConfirmation();
    }
    user.createProfile();

    return user;
  }
}
