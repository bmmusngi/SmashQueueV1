import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  // Save a new player to the database
  async createPlayer(data: Prisma.PlayerUncheckedCreateInput) {
    return this.prisma.player.create({
      data,
    });
  }

  // Get all players for a specific queue session
  async getPlayersBySession(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Update payment status or skill level
  async updatePlayer(id: string, data: Prisma.PlayerUpdateInput) {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }
}
