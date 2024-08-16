import { IsNumber, IsString } from 'class-validator';

export class CreateChargeDto {
  @IsString()
  paymentMethodId: string;

  @IsNumber()
  amount: number;
}
