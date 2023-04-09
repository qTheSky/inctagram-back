import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEmailConfirmation } from './user-email-confirmation.entity';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UserProfileEntity } from './user-profile.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  email: string;
  @Column()
  login: string;
  @Column()
  passwordHash: string;
  //по приколу
  @Column()
  password: string;
  //по приколу

  @OneToOne(() => UserEmailConfirmation, (emailConfirm) => emailConfirm.user, {
    cascade: true,
  })
  emailConfirmation: UserEmailConfirmation;

  @OneToOne(() => UserProfileEntity, (profile) => profile.user, {
    cascade: true,
  })
  profile: UserProfileEntity;

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

  static create(
    userName: string,
    email: string,
    passwordHash: string,
    password: string
  ): UserEntity {
    const user = new UserEntity();

    user.login = userName;
    user.email = email;
    user.passwordHash = passwordHash;
    user.createdAt = new Date();

    user.password = password;

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
