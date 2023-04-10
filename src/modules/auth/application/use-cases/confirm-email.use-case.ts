import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../../modules/users/infrastructure';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepository
  ) {}
  async execute(command: ConfirmEmailCommand) {
    const user =
      await this.usersQueryRepository.findUserByEmailConfirmationCode(
        command.code
      );
    if (!user) return;
    if (!user.isEmailCanBeConfirmed(command.code)) return;
    user.confirmEmail(command.code);
    await this.usersRepository.save(user);
  }
}
