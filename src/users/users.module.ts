import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, StripeService],
  exports: [UsersService],
})
export class UsersModule {}
