import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma/prisma.service';
import { PaymentDto } from './payment.dto';
import { PaymentStatus } from '.prisma/client/payments';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PaymentsService {
  constructor(
    private prismaService: PrismaService,
    @Inject('PAYMENTS_SERVICES')
    private clientKafka: ClientKafka,
  ) {}
  all() {
    return this.prismaService.payment.findMany();
  }

  async payment(paymentDto: PaymentDto) {
    const payment = await this.prismaService.payment.create({
      data: { ...paymentDto, status: PaymentStatus.APPROVED },
    });
    await lastValueFrom(this.clientKafka.emit('payments', payment));
    return payment;
  }
}
