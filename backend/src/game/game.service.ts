import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  // 1. SAFE UPDATE: Handles nested team updates
  async updateGame(id: string, data: any) {
    return this.prisma.game.update({
      where: { id },
      data: {
        type: data.type,
        // We use 'set' to replace the teams with the new selection
        teamA: data.teamA?.set ? { set: data.teamA.set } : undefined,
        teamB: data.teamB?.set ? { set: data.teamB.set } : undefined,
      },
      include: { teamA: true, teamB: true }
    });
  }

  async getGamesBySession(sessionId: string) {
    return this.prisma.game.findMany({
      where: { sessionId },
      include: { teamA: true, teamB: true },
      orderBy: { createdAt: 'desc' }, // Descending often better for recent matches
    });
  }

  // 2. ASSIGN TO COURT: Now uses the String courtId from our new schema
  async assignToCourt(gameId: string, courtId: string) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: { 
        courtId: courtId, 
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });
  }

  // 3. CREATE GAME: Explicitly connects the Session and Teams
  async createGame(data: any) {
    return this.prisma.game.create({
      data: {
        session: { connect: { id: data.session?.connect?.id || data.sessionId } },
        type: data.type || 'DOUBLES',
        status: 'PENDING',
        teamA: { connect: data.teamA?.connect || [] },
        teamB: { connect: data.teamB?.connect || [] },
      },
    });
  }

  async completeGame(gameId: string, shuttlesUsed: number, winner?: string) {
    return this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'COMPLETED',
        courtId: null, // Frees up the hardcoded court ID
        endedAt: new Date(),
        shuttlesUsed: shuttlesUsed || 0,
        winner: winner,
      },
      include: { teamA: true, teamB: true }
    });
  }
}
