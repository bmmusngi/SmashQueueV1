import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
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

  // FIXED: Changed cloneToSession to joinSession to match the service logic
  // and ensured it returns the result of the service call.
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
}
