import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  create(@Body() createPlayerDto: any) {
    return this.playerService.createPlayer(createPlayerDto);
  }

  @Get('session/:sessionId')
  findAll(@Param('sessionId') sessionId: string) {
    return this.playerService.getPlayersBySession(sessionId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.playerService.updatePlayer(id, updateData);
  }
}
