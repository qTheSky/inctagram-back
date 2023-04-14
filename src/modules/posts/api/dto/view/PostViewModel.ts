import { ApiProperty } from '@nestjs/swagger';

export class PostViewModel {
  @ApiProperty({
    description: 'id',
    example: '3123213123',
    type: 'string',
  })
  id: string;
  @ApiProperty({
    description: 'photo url',
    example: 'https://url.com/photo.jpg',
    type: 'string',
    format: 'url',
  })
  photoUrl: string;
  @ApiProperty({
    description: 'post description',
    example: 'frontend noobs',
    type: 'string',
  })
  description: string;
  @ApiProperty({
    description: 'date when post was created',
    example: new Date('2023-04-10T16:20:10.847Z'),
    type: 'string',
  })
  createdAt: Date;
  @ApiProperty({
    description: 'date when post was created',
    example: new Date('2023-04-10T16:20:10.847Z'),
    type: 'string',
  })
  updatedAt: Date;
}
