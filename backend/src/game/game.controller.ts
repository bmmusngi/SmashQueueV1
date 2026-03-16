import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { GameService } from './game.service';
import { Prisma } from '@prisma/client';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // POST http://localhost:3000/games
  @Post()
  create(@Body() createGameDto: Prisma.GameUncheckedCreateInput) {
    return this.gameService.createGame(createGameDto);
  }

  // GET http://localhost:3000/games/session/:sessionId
  @Get('session/:sessionId')
  findAll(@Param('sessionId') sessionId: string) {
    return this.gameService.getGamesBySession(sessionId);
  }

  // PATCH http://localhost:3000/games/:id/assign
  @Patch(':id/assign')
  assignToCourt(
    @Param('id') id: string, 
    @Body('courtId') courtId: string
  ) {
    return this.gameService.assignToCourt(id, courtId);
  }

  // PATCH http://localhost:3000/games/:id/complete
  @Patch(':id/complete')
  complete(
    @Param('id') id: string, 
    @Body() completeData: { shuttlesUsed: number; winner?: string }
  ) {
    return this.gameService.completeGame(id, completeData.shuttlesUsed, completeData.winner);
  }
}
