import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterDto } from '../../api/dto/input/register.dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailsManager } from '../../../notification/application/emails.manager';
import { UserEntity } from 'src/modules/users/entities';

export class RegistrationCommand {
  constructor(public dto: RegisterDto) {}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase
  implements ICommandHandler<RegistrationCommand>
{
  constructor(
    private emailsManager: EmailsManager,
    private usersRepository: UsersRepository
  ) {}
  async execute(command: RegistrationCommand): Promise<void> {
    const newUser = UserEntity.create(command.dto);
    this.emailsManager.sendEmailConfirmationMessage(newUser);
    await this.usersRepository.save(newUser);
  }
}
