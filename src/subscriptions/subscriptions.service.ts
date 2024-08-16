import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async create(userId: number, paymentMethodId: string, priceId: string) {
    const user = await this.prisma.users.findUnique({ where: { id: userId } });
    let customerId = user.stripeId;
    if (!customerId) {
      const custromer = await this.stripeService.createCustomer(
        user.email,
        paymentMethodId,
      );

      await this.prisma.users.update({
        where: { id: userId },
        data: { stripeId: custromer.id },
      });

      customerId = custromer.id;
    }

    const subscription = await this.stripeService.createSubscription(
      customerId,
      priceId,
    );

    return await this.prisma.subscriptions.create({
      data: {
        user: { connect: { id: userId } },
        stripeSubId: subscription.id,
        status: subscription.status,
        interval: subscription.items.data[0].price.recurring.interval,
        startDate: new Date(subscription.start_date * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
      },
    });
  }
}
