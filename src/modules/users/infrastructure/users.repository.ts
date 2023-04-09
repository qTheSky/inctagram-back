import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../shared/classes/abstract.repository';

@Injectable()
export class UsersRepository extends AbstractRepository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>
  ) {
    super(usersRepository);
  }

  async create(dto: {
    login: string;
    email: string;
    passwordHash: string;
    password: string;
  }): Promise<UserEntity> {
    const newUser = UserEntity.create(
      dto.login,
      dto.email,
      dto.passwordHash,
      dto.password
    );
    return await this.save(newUser);
  }

  async findUserByEmailConfirmationCode(
    confirmationCode: string
  ): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({
      where: { emailConfirmation: { confirmationCode } },
      relations: { emailConfirmation: true },
    });
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string
  ): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      relations: { emailConfirmation: true },
    });
  }
}
