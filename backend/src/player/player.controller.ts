import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  // Standard Session Player creation
  @Post()
  create(@Body() createPlayerDto: any) {
    return this.playerService.createPlayer(createPlayerDto);
  }

  // --- NEW: Global Member Routes ---
  @Get('global')
  findAllGlobal() {
    return this.playerService.getGlobalRoster();
  }

  @Post('bulk-global')
  bulkGlobal(@Body('players') players: any[]) {
    return this.playerService.bulkCreateGlobal(players);
  }

  // --- NEW: Session Player Routes ---
  @Get('session/:sessionId')
  findAll(@Param('sessionId') sessionId: string) {
    return this.playerService.getPlayersBySession(sessionId);
  }

  @Post('bulk-session')
  bulkSession(@Body('players') players: any[], @Body('sessionId') sessionId: string) {
    return this.playerService.bulkCreateSession(players, sessionId);
  }

  @Post(':id/join-session')
  joinSession(@Param('id') id: string, @Body('sessionId') sessionId: string) {
    return this.playerService.cloneToSession(id, sessionId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.playerService.updatePlayer(id, updateData);
  }
}
