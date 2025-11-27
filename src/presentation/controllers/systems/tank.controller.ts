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
import { TankService } from '../../../application/services/systems';
import { CreateTankDto, UpdateTankDto } from '../../dto/systems';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { Roles } from '../../../infrastructure/decorators/roles.decorator';

@Controller('tanks')
@UseGuards(JwtAuthGuard)
export class TankController {
  constructor(private readonly tankService: TankService) {}

  @Get()
  async findAll(@Query('systemId') systemId?: string) {
    if (systemId) {
      return this.tankService.findBySystemId(systemId);
    }
    return this.tankService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tankService.findById(id);
  }

  @Post()
  async create(@Body() createTankDto: CreateTankDto) {
    return this.tankService.create(createTankDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTankDto: UpdateTankDto,
  ) {
    return this.tankService.update(id, updateTankDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    await this.tankService.delete(id);
    return { message: 'Tank deleted successfully' };
  }
}
