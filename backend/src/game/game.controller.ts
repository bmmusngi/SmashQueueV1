import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // FIX: Changed from Prisma.GameCreateInput to 'any' to accept our custom payload
  @Post()
  create(@Body() createGameDto: any) {
    return this.gameService.createGame(createGameDto);
  }

  @Get('session/:sessionId')
  findAll(@Param('sessionId') sessionId: string) {
    return this.gameService.getGamesBySession(sessionId);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string, @Body('courtId') courtId: string) {
    return this.gameService.assignToCourt(id, courtId);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Body() resultData: any) {
    return this.gameService.completeGame(id, resultData.shuttlesUsed, resultData.winner);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.gameService.updateGame(id, updateData);
  }
}
