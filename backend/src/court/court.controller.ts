import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CourtService } from './court.service';

@Controller('courts')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}

  @Get()
  findAll() {
    return this.courtService.findAll();
  }

  @Post()
  create(@Body() data: { name: string; number: number }) {
    return this.courtService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; status?: string }) {
    return this.courtService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courtService.remove(id);
  }
}
