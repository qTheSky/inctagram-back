import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from 'src/modules/users/infrastructure';
import { UsersRepository } from 'src/modules/users/infrastructure/users.repository';
import { AuthService } from '../auth.service';

export class NewPasswordCommand {
  constructor(public newPassword: string, public recoveryCode: string) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    private readonly authServiec: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository
  ) {}
  async execute({
    newPassword,
    recoveryCode,
  }: NewPasswordCommand): Promise<void> {
    const user = await this.usersQueryRepository.findUserByRecoveryCode(
      recoveryCode
    );
    if (!user) {
      throw new NotFoundException();
    }
    if (!user.isNewPasswordCanBeSet(recoveryCode))
      throw new ForbiddenException();

    const newPasswordHash = await this.authServiec.generatePasswordHash(
      newPassword
    );

    user.updatePasswordHash(newPasswordHash, recoveryCode);
    user.makePasswordRecoveryCodeUsed();
    await this.usersRepository.save(user);
  }
}
