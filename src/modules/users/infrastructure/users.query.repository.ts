import { Injectable } from '@nestjs/common';
import { UserEntity } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from 'src/modules/posts/entities/post.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersQueryRepository: Repository<UserEntity>
  ) {}

  async findUserByIdWithEmailConfirmation(
    id: string
  ): Promise<UserEntity | null> {
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

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    return await this.usersQueryRepository.findOneBy({ email });
  }

  async findUserById(userId: string): Promise<UserEntity | null> {
    return await this.usersQueryRepository.findOne({
      where: { id: userId },
      relations: { favoritePosts: true },
    });
  }

  async findUserByRecoveryCode(
    recoveryCode: string
  ): Promise<UserEntity | null> {
    return await this.usersQueryRepository.findOne({
      where: { passwordRecovery: { recoveryCode } },
      relations: { passwordRecovery: true },
    });
  }

  async findUserPostById(userId: string, postId: string): Promise<PostEntity> {
    const user = await this.usersQueryRepository.findOne({
      where: { id: userId },
      relations: { favoritePosts: { photos: true } },
    });
    return user.favoritePosts.find((post) => post.id === postId);
  }

  async findAllUserPosts(userId: string): Promise<PostEntity[]> {
    const user = await this.usersQueryRepository.findOne({
      where: { id: userId },
      relations: { favoritePosts: { photos: true } },
    });
    console.log(user);
    return user.favoritePosts;
  }
}
