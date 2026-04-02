import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProfilService } from './profil.service';

@ApiTags('Profil')
@Controller('profil')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfilController {
  constructor(private readonly profilService: ProfilService) {}

  @Get('saya')
  @ApiOperation({ summary: 'Mendapat profil user yang sedang login' })
  getProfil(@CurrentUser('sub') userId: string) {
    return this.profilService.getProfil(userId);
  }

  @Patch('saya')
  @ApiOperation({ summary: 'Update profil (nama, jabatan, nip, unit kerja, no hp)' })
  updateProfil(@CurrentUser('sub') userId: string, @Body() data: any) {
    return this.profilService.updateProfil(userId, data);
  }
}
