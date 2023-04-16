import { ApiProperty } from '@nestjs/swagger';

export class AuthMeDto {
  @ApiProperty()
  email: string;
  @ApiProperty()
  login: string;
  @ApiProperty()
  userId: string;
}
