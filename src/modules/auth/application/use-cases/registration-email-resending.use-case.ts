import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../users/infrastructure';
import { EmailsManager } from '../../../notification/application/emails.manager';

export class RegistrationEmailResendingCommand {
  constructor(public email: string, public frontendLink: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private emailsManager: EmailsManager
  ) {}

  async execute({
    email,
    frontendLink,
  }: RegistrationEmailResendingCommand): Promise<void> {
    const user = await this.usersQueryRepository.findUserByLoginOrEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    user.updateConfirmationCode();
    this.emailsManager.sendEmailConfirmationMessage(
      user.email,
      user.emailConfirmation.confirmationCode,
      frontendLink
    );
    await this.usersRepository.save(user);
  }
}
