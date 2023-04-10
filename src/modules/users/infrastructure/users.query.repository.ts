import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersQueryRepository: Repository<UserEntity>
  ) {}

  async findUserById(id: string): Promise<UserEntity | null> {
    return await this.usersQueryRepository.findOne({
      where: { id },
      relations: { emailConfirmation: true },
    });
  }

  async findUserByEmailConfirmationCode(
    confirmationCode: string
  ): Promise<UserEntity | null> {
    return await this.usersQueryRepository.findOne({
      where: { emailConfirmation: { confirmationCode } },
      relations: { emailConfirmation: true },
    });
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string
  ): Promise<UserEntity | null> {
    return await this.usersQueryRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      relations: { emailConfirmation: true },
    });
  }

  async findUserByRecoveryCode(
    recoveryCode: string
  ): Promise<UserEntity | null> {
    return await this.usersQueryRepository.findOne({
      where: { passwordRecovery: { recoveryCode } },
      relations: { passwordRecovery: true },
    });
    // return this.usersQueryRepository
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.passwordRecovery', 'passwordRecovery')
    //   .where('passwordRecovery.recoveryCode = :code', { code })
    //   .getOne();
  }
}
