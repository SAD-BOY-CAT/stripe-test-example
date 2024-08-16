import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { CreateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async create(userData: CreateUserDto) {
    const newUser = await this.prismaService.users.create({
      data: { ...userData },
    });
    return newUser;
  }

  async getUser(email: string) {
    return await this.prismaService.users.findFirst({
      where: { email: email },
    });
  }
}
