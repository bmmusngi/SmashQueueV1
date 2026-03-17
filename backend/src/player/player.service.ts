import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PlayerService {
  constructor(private prisma: PrismaService) {}

  async getGlobalRoster() {
    return this.prisma.member.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getPlayersBySession(sessionId: string) {
    return this.prisma.player.findMany({
      where: { sessionId },
      include: { member: true },
    });
  }

  // THE FIX: Logic to convert a Global Member into a Session Player
  async joinSession(memberId: string, sessionId: string) {
    // 1. Find the member details
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) throw new NotFoundException('Member not found');

    // 2. Create a new Player record linked to this session
    // We 'clone' the member's data into the Player record for the session
    return this.prisma.player.create({
      data: {
        name: member.name,
        levelWeight: member.levelWeight,
        gender: member.gender,
        sessionId: sessionId,
        memberId: member.id, // Links back to the global member profile
        status: 'ACTIVE',
      },
      include: {
        member: true, // Crucial for frontend to see the link
      },
    });
  }

  async updateMember(id: string, data: any) {
    return this.prisma.member.update({
      where: { id },
      data,
    });
  }
  
    // 1. SOFT DELETE / UPDATE STATUS
  async updatePlayer(id: string, data: any) {
    return this.prisma.player.update({
      where: { id },
      data,
      include: { member: true } // Keep the member data attached for the UI
    });
  }
  
  // 2. HARD DELETE (With Safety Check)
  async removeSessionPlayer(id: string) {
    // Check if the player exists and include their game history
    const player = await this.prisma.player.findUnique({
      where: { id },
      include: { teamA_games: true, teamB_games: true }
    });
    
    if (!player) throw new NotFoundException('Player not found in session');
    
    // If they have been part of ANY game (even pending ones), block the hard delete
    const hasPlayed = player.teamA_games.length > 0 || player.teamB_games.length > 0;
    
    if (hasPlayed) {
      throw new BadRequestException('Cannot remove a player who has already been drafted into a game.');
    }
    
    // If clean, remove them completely from the session
    return this.prisma.player.delete({
      where: { id }
    });
  }
  
}
