import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterDto } from '../../api/dto/input/register.dto';
import { AuthService } from '../auth.service';
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
    private usersRepository: UsersRepository,
    private authService: AuthService
  ) {}
  async execute(command: RegistrationCommand): Promise<void> {
    const { password } = command.dto;
    const passwordHash = await this.authService.generatePasswordHash(password);
    const newUser = UserEntity.create(command.dto);
    this.emailsManager.sendEmailConfirmationMessage(newUser);
    await this.usersRepository.save(newUser);
  }
}
