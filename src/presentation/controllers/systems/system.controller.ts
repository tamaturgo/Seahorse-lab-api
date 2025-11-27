import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SystemService } from '../../../application/services/systems';
import { CreateSystemDto, UpdateSystemDto } from '../../dto/systems';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/guards/roles.guard';
import { Roles } from '../../../infrastructure/decorators/roles.decorator';

@Controller('systems')
@UseGuards(JwtAuthGuard)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  async findAll() {
    return this.systemService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.systemService.findById(id);
  }

  @Post()
  async create(@Body() createSystemDto: CreateSystemDto) {
    return this.systemService.create(createSystemDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSystemDto: UpdateSystemDto,
  ) {
    return this.systemService.update(id, updateSystemDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    await this.systemService.delete(id);
    return { message: 'System deleted successfully' };
  }
}
