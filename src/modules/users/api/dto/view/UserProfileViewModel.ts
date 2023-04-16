import { ApiProperty } from '@nestjs/swagger';

export class UserProfileViewModel {
  @ApiProperty({
    example: 'string',
    type: 'string',
  })
  userName: string;
  @ApiProperty({
    example: 'string',
    type: 'string',
  })
  name: string;
  @ApiProperty({
    example: 'string',
    type: 'string',
  })
  surName: string;
  @ApiProperty({
    example: new Date('2023-04-10T16:20:10.847Z'),
    type: 'string',
  })
  dateOfBirthday: Date;
  @ApiProperty({
    example: 'string',
    type: 'string',
  })
  city: string;
  @ApiProperty({
    example: 'string',
    type: 'string',
  })
  aboutMe: string;
  @ApiProperty({
    example: 'string',
    type: 'string',
  })
  avatarUrl: string;
}
