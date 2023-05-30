import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository, UsersRepository } from '../../infrastructure';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserCommand {
  constructor(public email: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository
  ) {}
  async execute({ email }: DeleteUserCommand): Promise<void> {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    await this.usersRepository.delete(user);
  }
}
