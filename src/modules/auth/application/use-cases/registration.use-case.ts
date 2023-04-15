import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterDto } from '../../api/dto/input';
import { UsersRepository } from '../../../users/infrastructure';
import { EmailsManager } from '../../../notification/application/emails.manager';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../../users/entities';

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
  async execute({ dto }: RegistrationCommand): Promise<void> {
    const passwordHash = await this.authService.generatePasswordHash(
      dto.password
    );
    const newUser = UserEntity.create({
      login: dto.login,
      email: dto.email,
      password: dto.password,
      passwordHash,
    });
    this.emailsManager.sendEmailConfirmationMessage(newUser, dto.frontendLink);
    await this.usersRepository.save(newUser);
  }
}
