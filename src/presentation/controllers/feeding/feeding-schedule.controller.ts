import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { FeedingScheduleService } from '../../../application/services/feeding/feeding-schedule.service';
import {
  CreateFeedingScheduleDto,
  UpdateFeedingScheduleDto,
  UpdateDefaultFeedingSettingsDto,
  FeedingScheduleResponseDto,
  DefaultFeedingSettingsResponseDto,
  TankNextFeedingResponseDto,
  AllTanksNextFeedingResponseDto,
} from '../../dto/feeding';

@ApiTags('feeding')
@Controller('feeding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedingScheduleController {
  constructor(private readonly feedingScheduleService: FeedingScheduleService) {}

  // ========== Feeding Schedules (por tanque) ==========

  @Get('schedules')
  @ApiOperation({ summary: 'Listar todas as programações de alimentação' })
  async findAll(): Promise<FeedingScheduleResponseDto[]> {
    return this.feedingScheduleService.findAll();
  }

  @Get('schedules/tank/:tankId')
  @ApiOperation({ summary: 'Buscar programação de alimentação por tanque' })
  async findByTankId(@Param('tankId') tankId: string): Promise<FeedingScheduleResponseDto | null> {
    return this.feedingScheduleService.findByTankId(tankId);
  }

  @Post('schedules')
  @ApiOperation({ summary: 'Criar ou atualizar programação de alimentação' })
  async create(@Body() createDto: CreateFeedingScheduleDto): Promise<FeedingScheduleResponseDto> {
    return this.feedingScheduleService.create(createDto);
  }

  @Put('schedules/tank/:tankId')
  @ApiOperation({ summary: 'Atualizar programação de alimentação' })
  async update(
    @Param('tankId') tankId: string,
    @Body() updateDto: UpdateFeedingScheduleDto,
  ): Promise<FeedingScheduleResponseDto> {
    return this.feedingScheduleService.update(tankId, updateDto);
  }

  @Delete('schedules/tank/:tankId')
  @ApiOperation({ summary: 'Remover programação de alimentação (usará configurações padrão)' })
  async delete(@Param('tankId') tankId: string): Promise<void> {
    return this.feedingScheduleService.delete(tankId);
  }

  // ========== Default Settings ==========

  @Get('settings/default')
  @ApiOperation({ summary: 'Obter configurações padrão de alimentação' })
  async getDefaultSettings(): Promise<DefaultFeedingSettingsResponseDto | null> {
    return this.feedingScheduleService.getDefaultSettings();
  }

  @Put('settings/default')
  @ApiOperation({ summary: 'Atualizar configurações padrão de alimentação' })
  async updateDefaultSettings(
    @Body() updateDto: UpdateDefaultFeedingSettingsDto,
  ): Promise<DefaultFeedingSettingsResponseDto> {
    return this.feedingScheduleService.updateDefaultSettings(updateDto);
  }

  // ========== Next Feeding ==========

  @Get('next/tank/:tankId')
  @ApiOperation({ summary: 'Obter próxima alimentação de um tanque específico' })
  async getNextFeedingForTank(@Param('tankId') tankId: string): Promise<TankNextFeedingResponseDto> {
    return this.feedingScheduleService.getNextFeedingForTank(tankId);
  }

  @Get('next/all')
  @ApiOperation({ summary: 'Obter próxima alimentação de todos os tanques' })
  async getAllTanksNextFeeding(): Promise<AllTanksNextFeedingResponseDto> {
    return this.feedingScheduleService.getAllTanksNextFeeding();
  }
}
