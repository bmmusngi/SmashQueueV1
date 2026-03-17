import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  // 1. FIX: Translate frontend payload into Prisma 'connect' syntax
  async createGame(data: any) {
    return this.prisma.game.create({
      data: {
        type: data.type,
        status: data.status || 'PENDING',
        session: { connect: { id: data.sessionId } },
        // Map the flat string arrays into Prisma's expected format
        teamA: { connect: (data.teamAIds || []).map((id: string) => ({ id })) },
        teamB: { connect: (data.teamBIds || []).map((id: string) => ({ id })) }
      },
      include: { teamA: true, teamB: true }
    });
  }

  // 2. FIX: Translate updates using Prisma 'set' syntax to overwrite existing teams
  async updateGame(id: string, data: any) {
    return this.prisma.game.update({
      where: { id },
      data: {
        type: data.type,
        // Using 'set' removes the old players and replaces them with the new selection
        teamA: data.teamAIds ? { set: data.teamAIds.map((id: string) => ({ id })) } : undefined,
        teamB: data.teamBIds ? { set: data.teamBIds.map((id: string) => ({ id })) } : undefined
      },
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

  async completeGame(gameId: string, shuttlesUsed: number, winner?: string) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        courtId: null,
        endedAt: new Date(),
        shuttlesUsed: shuttlesUsed,
        winner: winner,
      },
      include: { teamA: true, teamB: true }
    });
  }
}
