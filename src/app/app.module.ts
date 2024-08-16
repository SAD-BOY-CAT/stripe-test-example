import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { StripeModule } from 'src/stripe/stripe.module';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    StripeModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
