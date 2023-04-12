import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../../modules/users/infrastructure';
import { NotFoundException } from '@nestjs/common';
import { EmailsManager } from '../../../../modules/notification/application/emails.manager';

export class PasswordRecoveryCommand {
  constructor(public email: string, public frontendUrl: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private emailsManager: EmailsManager
  ) {}

  async execute({
    email,
    frontendUrl,
  }: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);
    if (!user) {
      throw new NotFoundException();
    }

    const recoveryCode = user.createPasswordRecovery();
    this.emailsManager.sendPasswordRecoveryCode(
      user.email,
      recoveryCode,
      frontendUrl
    );

    await this.usersRepository.save(user);
  }
}
