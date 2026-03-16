import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async createGame(data: Prisma.GameCreateInput) {
    return this.prisma.game.create({
      data,
      include: { teamA: true, teamB: true }
    });
  }

  async getGamesBySession(sessionId: string) {
    return this.prisma.game.findMany({
      where: { sessionId },
      include: { teamA: true, teamB: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async assignToCourt(gameId: string, courtId: string) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'ACTIVE',
        courtId: courtId,
        startedAt: new Date(),
      },
      include: { teamA: true, teamB: true }
    });
  }

  // UPDATED: Finalizes the game in DB
  async completeGame(gameId: string, shuttlesUsed: number, winner?: string) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        courtId: null, // Free the court in the DB
        endedAt: new Date(),
        shuttlesUsed: shuttlesUsed,
        winner: winner,
      },
      include: { teamA: true, teamB: true }
    });
  }
}
