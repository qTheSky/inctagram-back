import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginatorInputModel {
  @IsOptional()
  @Transform((v) => toNumber(v.value, 1))
  @ApiProperty({ required: false, default: 1, type: Number })
  pageNumber = 1;
  @IsOptional()
  @Transform((v) => toNumber(v.value, 10))
  @ApiProperty({ required: false, default: 10, type: Number })
  pageSize = 10;
  @ApiProperty({
    required: false,
    default: '?sort=avgScores desc&sort=sumScore desc',
  })
  @IsOptional()
  sort: string | Array<string>;
}

const toNumber = (value: string, defaultValue: number): number => {
  try {
    const parsedInt = parseInt(value, 10);
    if (isNaN(parsedInt)) return defaultValue;
    return parsedInt;
  } catch {
    return defaultValue;
  }
};
