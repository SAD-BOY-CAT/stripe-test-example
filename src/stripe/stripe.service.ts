import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2024-06-20',
      },
    );
  }

  async createCustomer(email: string, paymentMethodId: string) {
    const customer = await this.stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    return customer;
  }

  async createSubscription(customerId: string, priceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
  }

  constructEvent(rawBody: string | Buffer, sig: string) {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      sig,
      'whsec_aaa5e9e4da6f73fea58f3fe530baee596f2efbfb89200a7afb617da780b0ea93',
    );
  }

  async handlePaymentWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        const invoicePayment = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaymentSucceeded(invoicePayment);
        break;
      case 'charge.succeeded':
        const charge = event.data.object as Stripe.Charge;
        await this.handleChargeSucceeded(charge);
        break;
      case 'invoice.paid':
        const invoicePaid = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaid(invoicePaid);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    await this.processPayment(invoice);
  }

  private async handleChargeSucceeded(charge: Stripe.Charge) {
    const paymentIntentId = charge.payment_intent as string;
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    const invoiceId = paymentIntent.invoice as string;

    if (!invoiceId) {
      console.log(`Invoice not found for payment intent ${paymentIntentId}`);
      return;
    }

    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    await this.processPayment(invoice);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    await this.processPayment(invoice);
  }

  private async processPayment(invoice: Stripe.Invoice) {
    const subscriptionId = invoice.subscription as string;

    const existingPayment = await this.prismaService.payments.findUnique({
      where: { stripePaymentId: invoice.id },
    });

    if (existingPayment) {
      console.log(
        `Duplicate payment detected for Stripe Payment ID ${invoice.id}`,
      );
      return;
    }

    const subscription = await this.prismaService.subscriptions.findUnique({
      where: { stripeSubId: subscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      console.log(`Subscription not found for Stripe ID ${subscriptionId}`);
      return;
    }

    const additionalDays = this.calculateSubscriptionPeriod(subscription);
    const oldPeriods = await this.prismaService.accessPeriods.findUnique({
      where: { userId: subscription.userId },
    });

    const oldDate = oldPeriods ? oldPeriods.endDate.getTime() : Date.now();
    const newEndDate = new Date(oldDate + additionalDays * 24 * 60 * 60 * 1000);

    await this.updateAccessPeriod(
      subscription.user.id,
      subscription.startDate || new Date(),
      newEndDate,
    );

    await this.prismaService.payments.create({
      data: {
        user: { connect: { id: subscription.userId } },
        subscription: { connect: { id: subscription.id } },
        stripePaymentId: invoice.id,
        amount: invoice.amount_paid / 100,
        status: invoice.status,
      },
    });
  }

  private calculateSubscriptionPeriod(subscription): number {
    const period = subscription.interval || 'month';
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return 30;
      case 'year':
        return 365;
      default:
        return 30;
    }
  }

  private async updateAccessPeriod(
    userId: number,
    startDate: Date,
    endDate: Date,
  ) {
    await this.prismaService.accessPeriods.upsert({
      where: { userId: userId },
      update: { endDate },
      create: {
        user: { connect: { id: userId } },
        startDate,
        endDate,
      },
    });
  }
}
