import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}
  async execute(command: ConfirmEmailCommand) {
    const user = await this.usersRepository.findUserByEmailConfirmationCode(
      command.code
    );
    if (!user) return;
    if (!user.isEmailCanBeConfirmed(command.code)) return;
    user.confirmEmail(command.code);
    await this.usersRepository.save(user);
  }
}
