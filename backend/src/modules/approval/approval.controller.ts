import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PeranPengguna } from '@prisma/client';
import { ApprovalService } from './approval.service';

@Controller('approval')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get()
  @Roles(PeranPengguna.superadmin)
  async daftarPermintaan(@Query('status') status?: string) {
    return this.approvalService.daftarPermintaan(status);
  }

  @Post(':id/setujui')
  @Roles(PeranPengguna.superadmin)
  async setujui(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.approvalService.setujui(id, userId);
  }

  @Post(':id/tolak')
  @Roles(PeranPengguna.superadmin)
  async tolak(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('alasan') alasan?: string,
  ) {
    return this.approvalService.tolak(id, userId, alasan);
  }
}
