import { Module } from '@nestjs/common';
import { CourtService } from './court.service';
import { CourtController } from './court.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CourtController],
  providers: [CourtService, PrismaService],
})
export class CourtModule {}
