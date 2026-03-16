import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  // Draft a new match (Pending Game)
  async createGame(data: Prisma.GameUncheckedCreateInput) {
    return this.prisma.game.create({
      data,
    });
  }

  // Fetch all games for a specific session (useful for initial page load)
  async getGamesBySession(sessionId: string) {
    return this.prisma.game.findMany({
      where: { sessionId },
      include: {
        teamA: true, // Pulls in the actual player details, not just IDs
        teamB: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Move a game from Pending to an Active Court
  async assignToCourt(gameId: string, courtId: string) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'ACTIVE',
        courtId: courtId,
        startedAt: new Date(),
      },
    });
  }

  // Finish the game and log the shuttle usage
  async completeGame(gameId: string, shuttlesUsed: number, winner?: string) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
        shuttlesUsed: shuttlesUsed,
        winner: winner,
      },
    });
  }
}
