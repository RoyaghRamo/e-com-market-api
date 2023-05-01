import { BaseDto } from './base.dto';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateProductDto extends BaseDto {
  @IsNumber()
  @IsInt()
  readonly categoryId: number;

  @IsString()
  readonly title: string;

  @IsString()
  readonly image: string;

  @IsString()
  readonly description: string;

  @IsNumber()
  readonly price: number;

  @IsNumber()
  readonly quantity: number;
}

export class UpdateProductDto extends PartialType<CreateProductDto>(
  CreateProductDto,
) {
  @IsOptional()
  id?: number;
}
