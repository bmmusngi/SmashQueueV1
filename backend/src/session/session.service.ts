import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  // Generate the YYYYMMDDXXXXXX ID and save to database
  async createSession() {
    // 1. Get current date in YYYYMMDD format
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // 2. Generate a random 6-character uppercase alphanumeric string
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 3. Combine them
    const sessionId = `${dateStr}${randomStr}`;

    // 4. Create the session in PostgreSQL
    return this.prisma.session.create({
      data: {
        id: sessionId,
        status: 'ACTIVE',
      },
    });
  }

  // Fetch the current active session for the frontend to load
  async getActiveSession() {
    return this.prisma.session.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }, // Get the most recently created one
    });
  }

  // End the session (e.g., when you pack up and go home)
  async completeSession(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED' },
    });
  }
}
