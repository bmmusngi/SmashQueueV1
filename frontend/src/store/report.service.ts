import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async getAttendanceReport() {
    const sessions = await this.prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        players: {
          // NOTE: This assumes 'paymentStatus' and 'paymentMethod' have been
          // added to the 'Player' model in your Prisma schema.
          select: {
            id: true,
            name: true,
            paymentStatus: true,
            paymentMethod: true,
          },
        },
      },
    });
    return sessions;
  }

  async getGameHistoryReport() {
    const sessions = await this.prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        games: {
          where: { status: 'COMPLETED' },
          orderBy: { endedAt: 'asc' },
          include: {
            teamA: { select: { name: true } },
            teamB: { select: { name: true } },
          },
        },
      },
    });
    return sessions;
  }
}