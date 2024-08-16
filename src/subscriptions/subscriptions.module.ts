import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PrismaService, StripeService, UsersService],
})
export class SubscriptionsModule {}
