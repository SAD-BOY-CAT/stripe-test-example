import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Res,
  RawBodyRequest,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from 'src/stripe/stripe.service';
import { AuthGuard } from 'src/guards/auth.guard';
import { UsersService } from 'src/users/users.service';
import { Request, Response } from 'express';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
    private readonly userService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('create')
  async createSubscription(
    @Req() req,
    @Body() createSubscriptionDto: { priceId: string; paymentMethodId: string },
  ) {
    const user = await this.userService.getUser(req.user.email as string);
    return this.subscriptionsService.create(
      user.id,
      createSubscriptionDto.paymentMethodId,
      createSubscriptionDto.priceId,
    );
  }

  @Post('webhook')
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Res() response: Response,
  ) {
    const sig = request.headers['stripe-signature'] as string;
    let event;
    try {
      event = this.stripeService.constructEvent(request.rawBody, sig);
    } catch (err) {
      console.log(`Webhook signature verification failed.`);
      return response.sendStatus(400);
    }

    await this.stripeService.handlePaymentWebhook(event);

    response.sendStatus(200);
  }
}
