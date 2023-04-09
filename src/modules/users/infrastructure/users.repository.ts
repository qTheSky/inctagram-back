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
    userName: string;
    email: string;
    passwordHash: string;
    password: string;
  }): Promise<UserEntity> {
    const newUser = UserEntity.create(
      dto.userName,
      dto.email,
      dto.passwordHash,
      dto.password
    );
    return await this.save(newUser);
  }

  async findUserByEmailConfirmationCode(
    confirmationCode: string
  ): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { emailConfirmation: { confirmationCode } },
      relations: { emailConfirmation: true },
    });
  }

  async findUserByUserNameOrEmail(
    userNameOrEmail: string
  ): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({
      where: [{ userName: userNameOrEmail }, { email: userNameOrEmail }],
      relations: { emailConfirmation: true },
    });
  }
}
