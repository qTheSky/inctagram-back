import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IGoogleUser } from '../../interfaces/google.user.interface';
import { ISessionMetadata } from '../../../security/interfaces/session-metadata.interface';

export class GoogleLoginCommand {
  constructor(
    public googleUser: IGoogleUser,
    public sessionMetadata: ISessionMetadata
  ) {}
}

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginUseCase implements ICommandHandler<GoogleLoginCommand> {
  constructor(private commandBus: CommandBus) {}

  async execute(command: GoogleLoginCommand) {
    // You can use this to create a new user account, update an existing user's details,
    console.log(command.sessionMetadata);
    // this.commandBus.execute(new LoginCommand());
  }
}
