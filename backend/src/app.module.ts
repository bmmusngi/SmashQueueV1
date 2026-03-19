import { Module } from '@nestjs/common';
import { PlayerModule } from './player/player.module';
import { QueueModule } from './queue/queue.module';
import { SessionModule } from './session/session.module';
import { GameModule } from './game/game.module';
import { ReportModule } from './report/report.module';

@Module({
  imports: [
    PlayerModule, 
    QueueModule, 
    SessionModule,
    GameModule,
    ReportModule
    ],
  controllers: [],
  providers: [],
})
export class AppModule {}
