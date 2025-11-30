import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { Roles } from '../../../infrastructure/decorators/roles.decorator';
import { FoodTypeService } from '../../../application/services/feeding/food-type.service';
import {
  CreateFoodTypeDto,
  UpdateFoodTypeDto,
  FoodTypeResponseDto,
} from '../../dto/feeding/food-type.dto';

@ApiTags('food-types')
@Controller('food-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FoodTypeController {
  constructor(private readonly foodTypeService: FoodTypeService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Criar tipo de alimento (admin only)' })
  async create(@Body() createDto: CreateFoodTypeDto): Promise<FoodTypeResponseDto> {
    return this.foodTypeService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de alimento' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async findAll(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<FoodTypeResponseDto[]> {
    const includeInactiveBool = includeInactive === 'true';
    return this.foodTypeService.findAll(includeInactiveBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tipo de alimento por ID' })
  async findById(@Param('id') id: string): Promise<FoodTypeResponseDto> {
    return this.foodTypeService.findById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar tipo de alimento (admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateFoodTypeDto,
  ): Promise<FoodTypeResponseDto> {
    return this.foodTypeService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Deletar tipo de alimento (admin only)' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.foodTypeService.delete(id);
  }

  @Post(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Alternar status ativo/inativo (admin only)' })
  async toggleActive(@Param('id') id: string): Promise<FoodTypeResponseDto> {
    return this.foodTypeService.toggleActive(id);
  }
}
