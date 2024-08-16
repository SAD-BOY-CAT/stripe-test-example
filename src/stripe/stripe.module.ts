import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [StripeService, PrismaService],
})
export class StripeModule {}
