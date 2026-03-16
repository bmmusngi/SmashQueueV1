import { Module } from '@nestjs/common';
import { PlayerModule } from './player/player.module';
import { QueueModule } from './queue/queue.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    PlayerModule, 
    QueueModule, 
    SessionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
