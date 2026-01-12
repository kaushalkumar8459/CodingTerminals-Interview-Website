import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard)
export class AuditLogsController {
  constructor(private auditLogsService: AuditLogsService) {}

  @Get()
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.auditLogsService.getStats();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.auditLogsService.findByUserId(userId);
  }

  @Get('module/:module')
  findByModule(@Param('module') module: string) {
    return this.auditLogsService.findByModule(module);
  }

  @Get('action/:action')
  findByAction(@Param('action') action: string) {
    return this.auditLogsService.findByAction(action);
  }

  @Get('range')
  getActivityByDate(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.auditLogsService.getActivityByDate(new Date(startDate), new Date(endDate));
  }
}
