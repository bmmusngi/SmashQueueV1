import { Controller, Post, Get, Param, Patch } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // POST http://localhost:3000/sessions
  @Post()
  create() {
    return this.sessionService.createSession();
  }

  // GET http://localhost:3000/sessions/active
  @Get('active')
  getActive() {
    return this.sessionService.getActiveSession();
  }

  // PATCH http://localhost:3000/sessions/:id/complete
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.sessionService.completeSession(id);
  }
}
