import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourtService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.court.findMany({
      orderBy: { number: 'asc' },
      include: { activeGames: { where: { status: 'ACTIVE' } } }
    });
  }

  async create(data: Prisma.CourtCreateInput) {
    return this.prisma.court.create({ data });
  }

  async update(id: string, data: Prisma.CourtUpdateInput) {
    return this.prisma.court.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    // Safety check: Don't delete if a game is currently active
    const court = await this.prisma.court.findUnique({
      where: { id },
      include: { activeGames: { where: { status: 'ACTIVE' } } }
    });

    if (court?.activeGames.length > 0) {
      throw new Error('Cannot delete a court with an active match.');
    }

    return this.prisma.court.delete({ where: { id } });
  }
}
