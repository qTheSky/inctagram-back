import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository, UsersRepository } from '../../infrastructure';

export class SubscribeToUserCommand {
  constructor(
    public userIdForSubscribe: string,
    public currentUserId: string
  ) {}
}
@CommandHandler(SubscribeToUserCommand)
export class SubscribeToUserUseCase
  implements ICommandHandler<SubscribeToUserCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  async execute({
    userIdForSubscribe,
    currentUserId,
  }: SubscribeToUserCommand): Promise<boolean> {
    return false;
    // const userForSubscribe = await this.usersRepository.findOne({
    //   id: userIdForSubscribe,
    // });
    // const userWhoWantsToSubscribe = await this.usersRepository.findOne({
    //   id: currentUserId,
    // });
    // if (!userForSubscribe) throw new NotFoundException('User not found');
    // const currentSubscription = await this.userSubscriptionsRepository.findOne({
    //   subscribeFromId: currentUserId,
    //   subscribeToId: userIdForSubscribe,
    // });
    // if (currentSubscription) {
    //   await this.userSubscriptionsRepository.delete(currentSubscription);
    //   return false;
    // } else {
    //   const subscription = new UserSubscriptionEntity();
    //   subscription.subscribeTo = userForSubscribe;
    //   subscription.subscribeFrom = userWhoWantsToSubscribe;
    //   await this.userSubscriptionsRepository.save(subscription);
    //   return true;
    // }
  }
}
