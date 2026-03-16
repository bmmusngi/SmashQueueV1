import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { GameService } from './game.service';
import { Prisma } from '@prisma/client';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create(@Body() createGameDto: Prisma.GameCreateInput) {
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

  // --- FIXED THIS LINE: Uses gameService instead of prisma ---
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.gameService.updateGame(id, updateData);
  }
}
