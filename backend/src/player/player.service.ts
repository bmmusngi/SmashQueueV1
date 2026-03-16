import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayersService {
  constructor(private prisma: PrismaService) {}

  // GET ALL SESSION PLAYERS
  async getSessionPlayers(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId },
      include: {
        // We include the member, but remember it might be null
        member: true, 
      },
    });
  }

  // JOIN SESSION (CONVERT MEMBER TO PLAYER)
  async joinSession(memberId: string, sessionId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.player.create({
      data: {
        name: member.name,
        levelWeight: member.levelWeight,
        gender: member.gender,
        sessionId: sessionId,
        memberId: member.id, // Optional link
        status: 'ACTIVE',
      },
    });
  }

  // UPDATE PLAYER STATUS (SAFE CHECK)
  async updatePlayerStatus(playerId: string, status: string) {
    return this.prisma.player.update({
      where: { id: playerId },
      data: { status },
    });
  }

  // GET GLOBAL ROSTER
  async getGlobalRoster() {
    return this.prisma.member.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
