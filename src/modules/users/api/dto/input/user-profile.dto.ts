import { IsDate, IsOptional, IsString, Length, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @Length(6, 30)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'User display name.',
    example: 'string',
    type: 'string',
    required: false,
  })
  userName: string;
  @Length(1, 30)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'user name',
    example: 'string',
    type: 'string',
    required: false,
  })
  name: string;
  @Length(1, 30)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'user surname',
    example: 'string',
    type: 'string',
    required: false,
  })
  surName: string;
  @IsDate()
  @Type(() => Date)
  @MaxDate(new Date())
  @IsOptional()
  @ApiProperty({
    description: 'date of birthday user',
    example: 'some date',
    type: 'string',
    required: false,
  })
  dateOfBirthday: Date | null;
  @Length(1, 50)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'city of user',
    example: 'string',
    type: 'string',
    required: false,
  })
  city: string;
  @Length(1, 200)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'information about user',
    example: 'string',
    type: 'string',
    required: false,
  })
  aboutMe: string;

  //tets
}
