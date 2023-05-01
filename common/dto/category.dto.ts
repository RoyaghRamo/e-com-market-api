import { BaseDto } from './base.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCategoryDto extends BaseDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;
}

export class UpdateCategoryDto extends PartialType<CreateCategoryDto>(
  CreateCategoryDto,
) {
  @IsOptional()
  id?: number;
}
