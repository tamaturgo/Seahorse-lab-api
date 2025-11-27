import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../infrastructure/decorators/current-user.decorator';
import { WaterParameterService } from '../../../application/services/water-parameters/water-parameter.service';
import { CreateWaterParameterDto, WaterParameterResponseDto } from '../../dto/water-parameters';

@ApiTags('water-parameters')
@Controller('water-parameters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WaterParameterController {
  constructor(private readonly waterParameterService: WaterParameterService) {}

  @Post()
  @ApiOperation({ summary: 'Criar registro de parâmetros da água' })
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreateWaterParameterDto,
  ): Promise<WaterParameterResponseDto> {
    return this.waterParameterService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros de parâmetros da água' })
  async findAll(
    @Query('systemId') systemId?: string,
    @Query('tankId') tankId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<WaterParameterResponseDto[]> {
    return this.waterParameterService.findAll({ systemId, tankId, startDate, endDate });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar registro de parâmetros por ID' })
  async findById(@Param('id') id: string): Promise<WaterParameterResponseDto> {
    return this.waterParameterService.findById(id);
  }

  @Get('system/:systemId')
  @ApiOperation({ summary: 'Buscar registros de parâmetros por sistema' })
  async findBySystemId(@Param('systemId') systemId: string): Promise<WaterParameterResponseDto[]> {
    return this.waterParameterService.findBySystemId(systemId);
  }

  @Get('tank/:tankId')
  @ApiOperation({ summary: 'Buscar registros de parâmetros por tanque' })
  async findByTankId(@Param('tankId') tankId: string): Promise<WaterParameterResponseDto[]> {
    return this.waterParameterService.findByTankId(tankId);
  }
}
