import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateImage } from '../../../files/utils/validate-image';
import { FilesManager } from '../../../files/application/files.manager';
import { UsersProfilesRepository } from '../../infrastructure';

export class UploadUserAvatarCommand {
  constructor(
    public avatar: Express.Multer.File,
    public currentUserId: string
  ) {}
}
@CommandHandler(UploadUserAvatarCommand)
export class UploadUserAvatarUseCase
  implements ICommandHandler<UploadUserAvatarCommand>
{
  constructor(
    private filesManager: FilesManager,
    private usersProfilesRepository: UsersProfilesRepository
  ) {}
  async execute({ avatar, currentUserId }: UploadUserAvatarCommand) {
    const profile = await this.usersProfilesRepository.findOne({
      userId: currentUserId,
    });
    const { validatedImage } = await validateImage(avatar, {
      maxFileSizeKB: 1000,
    });
    const { url } = await this.filesManager.uploadFile(
      `content/users/${currentUserId}/avatar`,
      validatedImage
    );
    profile.avatarPath = url;
    await this.usersProfilesRepository.save(profile);
    return this.usersProfilesRepository.buildProfileViewModel(profile);
  }
}
