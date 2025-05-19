import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OfficesService } from './offices.service';
import { CreateOfficeDto } from './dto/create-office.dto';
import { UpdateOfficeDto } from './dto/update-office.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Office } from './entities/office.entity';
import { Roles } from '../auth/decorator/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Offices')
@ApiBearerAuth('JWT')
@Controller('offices')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new office' })
  @ApiResponse({
    status: 201,
    description: 'Office successfully created with admin user',
    type: Office,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async create(@Body() createOfficeDto: CreateOfficeDto): Promise<Office> {
    return this.officesService.create(createOfficeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all offices' })
  @ApiResponse({
    status: 200,
    description: 'Returns all offices',
    type: [Office],
  })
  async findAll(): Promise<Office[]> {
    return this.officesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an office by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the office',
    type: Office,
  })
  @ApiResponse({ status: 404, description: 'Office not found' })
  async findOne(@Param('id') id: string): Promise<Office> {
    return this.officesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an office' })
  @ApiResponse({
    status: 200,
    description: 'Office successfully updated',
    type: Office,
  })
  @ApiResponse({ status: 404, description: 'Office not found' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() updateOfficeDto: UpdateOfficeDto,
  ): Promise<Office> {
    return this.officesService.update(id, updateOfficeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an office' })
  @ApiResponse({ status: 204, description: 'Office successfully deleted' })
  @ApiResponse({ status: 404, description: 'Office not found' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.officesService.remove(id);
  }
}
