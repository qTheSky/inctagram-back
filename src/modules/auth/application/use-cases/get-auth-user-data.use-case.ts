import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { AuthMeDto } from '../../api/dto/output/auth-me.dto';
import { InternalServerErrorException } from '@nestjs/common';

export class GetAuthUserDataCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetAuthUserDataCommand)
export class GetAuthUserDataUseCase
  implements ICommandHandler<GetAuthUserDataCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: GetAuthUserDataCommand): Promise<AuthMeDto> {
    const user = await this.usersRepository.findOne({ id: command.userId });
    if (!user) throw new InternalServerErrorException('User not found');
    return {
      userId: user.id,
      email: user.email,
      userName: user.userName,
    };
  }
}
