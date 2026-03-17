import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

  async joinSession(memberId: string, sessionId: string) {
    // Check if player is already in this session to prevent duplicates
    const existing = await this.prisma.player.findFirst({
      where: { memberId, sessionId }
    });
    
    if (existing) return existing;

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
        memberId: member.id,
        status: 'ACTIVE',
      },
      include: { member: true },
    });
  }

  async addMember(data: any) {
    const { name, levelWeight, gender, status, sessionId } = data;
    
    // Create the Global Member record
    const member = await this.prisma.member.create({
      data: {
        name: name.trim(),
        levelWeight: Number(levelWeight), // Force conversion to Number
        gender,
        status: status || 'ACTIVE',
      },
    });
    
    // Auto-check into session if ID is provided
    if (sessionId) {
      await this.prisma.player.create({
        data: {
          name: member.name,
          levelWeight: member.levelWeight,
          gender: member.gender,
          memberId: member.id,
          sessionId: sessionId,
        },
      });
    }
    
    return member;
  }

  async updateMember(id: string, data: any) {
    // Explicitly map only the fields that belong in the Member model
    // This prevents "Unknown Argument" errors if the frontend sends extra data
    return this.prisma.member.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        levelWeight: data.levelWeight ? Number(data.levelWeight) : undefined,
        gender: data.gender,
        status: data.status,
      },
    });
  }
}
