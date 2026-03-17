// FIX: Added 'Delete' to the import list
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('global')
  findAllGlobal() {
    return this.playerService.getGlobalRoster();
  }

  @Get('session/:sessionId')
  findAll(@Param('sessionId') sessionId: string) {
    return this.playerService.getPlayersBySession(sessionId);
  }

  @Post(':id/join-session')
  async joinSession(
    @Param('id') memberId: string, 
    @Body('sessionId') sessionId: string
  ) {
    return await this.playerService.joinSession(memberId, sessionId);
  }

  @Patch('member/:id')
  updateMember(@Param('id') id: string, @Body() updateData: any) {
    return this.playerService.updateMember(id, updateData);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.playerService.updatePlayer(id, updateData);
  }
 
  // NEW: Hard Delete Route
  @Delete(':id')
  removeSessionPlayer(@Param('id') id: string) {
    return this.playerService.removeSessionPlayer(id);
  }
}
