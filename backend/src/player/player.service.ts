import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  // Create a single session player (Walk-in)
  async createPlayer(data: any) {
    return this.prisma.player.create({ data });
  }

  // Global Roster: Bulk Registration
  async bulkCreateGlobal(members: any[]) {
    return this.prisma.$transaction(
      members.map(m => this.prisma.member.create({ data: m }))
    );
  }

  // Session: Bulk Walk-in Add
  async bulkCreateSession(players: any[], sessionId: string) {
    return this.prisma.$transaction(
      players.map(p => this.prisma.player.create({
        data: { ...p, sessionId }
      }))
    );
  }

  // Invite Member to Session
  async cloneToSession(memberId: string, sessionId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new Error('Member not found');
    
    return this.prisma.player.create({
      data: {
        name: member.name,
        levelWeight: member.levelWeight,
        gender: member.gender,
        sessionId: sessionId,
        memberId: member.id, // CRITICAL: This links the session player to the global member
        status: 'ACTIVE',
        paymentStatus: 'UNPAID'
      }
    });
  }


  async getGlobalRoster() {
    return this.prisma.member.findMany({ orderBy: { name: 'asc' } });
  }

  async getPlayersBySession(sessionId: string) {
    return this.prisma.player.findMany({ 
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async updatePlayer(id: string, data: any) {
    return this.prisma.player.update({
      where: { id },
      data,
    });
  }
  
  async updateMember(id: string, data: any) {
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }

}
