import { Column, Entity, OneToOne, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEmailConfirmation } from './user-email-confirmation.entity';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import * as bcrypt from 'bcrypt';
import { hash } from 'bcrypt';
import { UserProfileEntity } from './user-profile.entity';
import { UserBanInfoEntity } from './user-ban-info.entity';
import { UserPasswordRecoveryEntity } from './user-password-recovery.entity';
import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  email: string;
  @Column()
  login: string;
  @Column()
  passwordHash: string;

  @OneToOne(() => UserEmailConfirmation, (emailConfirm) => emailConfirm.user, {
    cascade: true,
  })
  emailConfirmation: UserEmailConfirmation;

  @OneToOne(() => UserBanInfoEntity, (ban) => ban.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  banInfo: UserBanInfoEntity;

  @OneToOne(() => UserPasswordRecoveryEntity, (password) => password.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  passwordRecovery: UserPasswordRecoveryEntity;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user, {
    cascade: true,
  })
  profile: UserProfileEntity;

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.passwordHash = await hash(this.passwordHash, 10);
  }

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

  updatePasswordHash(passworHash: string, passwordRecoveryCode: string): void {
    if (!this.isNewPasswordCanBeSet(passwordRecoveryCode)) {
      throw new InternalServerErrorException("This password hash can't be set");
    }
    this.passwordHash = passworHash;
  }

  isNewPasswordCanBeSet(recoveryCode: string): boolean {
    if (this.passwordRecovery.isCodeAlreadyUsed) return false;
    if (this.passwordRecovery.recoveryCode !== recoveryCode) return false;
    if (this.passwordRecovery.expirationDate < new Date()) return false;
    return true;
  }

  checkIsCanBeLoggedIn() {
    this.checkBan();
    this.checkIsEmailConfirmed();
  }

  checkBan(): void {
    if (this.isBanned) {
      throw new ForbiddenException();
    }
  }

  get isBanned(): boolean {
    return this.banInfo.isBanned;
  }

  checkIsEmailConfirmed() {
    if (!this.isEmailConfirmed) {
      throw new ForbiddenException();
    }
  }

  get isEmailConfirmed(): boolean {
    return this.emailConfirmation.isConfirmed;
  }

  async isHashedEquals(password: string): Promise<{ userId: string }> {
    const isEqual = await bcrypt.compare(password, this.passwordHash);
    if (!isEqual) {
      throw new UnauthorizedException();
    }
    return { userId: this.id };
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

  ban(banReason: string): void {
    this.banInfo.isBanned = true;
    this.banInfo.banDate = new Date();
    this.banInfo.banReason = banReason;
  }

  unBan(): void {
    this.banInfo.isBanned = false;
    this.banInfo.banDate = null;
    this.banInfo.banReason = null;
  }

  static create(
    login: string,
    email: string,
    passwordHash: string
  ): UserEntity {
    const user = new UserEntity();

    user.login = login;
    user.email = email;
    user.passwordHash = passwordHash;
    user.createdAt = new Date();

    user.createEmailConfirmation();
    user.createProfile();

    return user;
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
}
