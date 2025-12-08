import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { DietService } from '../../../application/services/feeding/diet.service';
import { CreateDietDto, DietResponseDto, UpdateDietDto } from '../../dto/feeding';

@ApiTags('feeding')
@Controller('feeding/diets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DietController {
  constructor(private readonly dietService: DietService) {}

  @Post()
  @ApiOperation({ summary: 'Criar dieta para um tanque' })
  async create(@Body() dto: CreateDietDto): Promise<DietResponseDto> {
    return this.dietService.create(dto);
  }

  @Get('diet-templates')
  @ApiOperation({ summary: 'Listar todos os modelos de dieta' })
  async findAllTemplates(): Promise<DietResponseDto[]> {
    return this.dietService.findAll();
  }

  @Get('tank/:tankId/active')
  @ApiOperation({ summary: 'Obter dieta ativa de um tanque' })
  async findActiveByTank(@Param('tankId') tankId: string): Promise<DietResponseDto | null> {
    return this.dietService.findActiveByTankId(tankId);
  }

  @Get('tank/:tankId')
  @ApiOperation({ summary: 'Listar dietas de um tanque' })
  async findByTank(@Param('tankId') tankId: string): Promise<DietResponseDto[]> {
    return this.dietService.findByTankId(tankId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar dieta por ID' })
  async findById(@Param('id') id: string): Promise<DietResponseDto> {
    return this.dietService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dieta' })
  async update(@Param('id') id: string, @Body() dto: UpdateDietDto): Promise<DietResponseDto> {
    return this.dietService.update(id, dto);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Ativar dieta (desativa as demais do tanque)' })
  async activate(@Param('id') id: string): Promise<DietResponseDto> {
    return this.dietService.activate(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Desativar dieta' })
  async deactivate(@Param('id') id: string): Promise<DietResponseDto> {
    return this.dietService.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover dieta' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.dietService.delete(id);
  }
}
