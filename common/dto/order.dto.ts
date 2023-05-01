import { BaseDto } from './base.dto';
import { IsBoolean, IsInt, IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateOrderDto extends BaseDto {
  @IsNumber()
  @IsInt()
  productId: number;

  @IsNumber()
  @IsInt()
  quantity: number;

  @IsBoolean()
  paid: boolean;
}

export class UpdateOrderDto extends PartialType<CreateOrderDto>(
  CreateOrderDto,
) {
  @IsOptional()
  id?: number;
}
