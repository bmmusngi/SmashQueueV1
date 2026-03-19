import { Controller, Get } from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('attendance')
  getAttendanceReport() {
    return this.reportService.getAttendanceReport();
  }

  @Get('game-history')
  getGameHistoryReport() {
    return this.reportService.getGameHistoryReport();
  }
}