import { IsInt, IsNumber } from 'class-validator';

export class BaseDto {
  @IsNumber()
  @IsInt()
  readonly userId: number;
}
