import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Attendances')
@ApiBearerAuth('JWT')
@Controller('attendances')
export class AttendancesController {
  constructor(private readonly attendancesService: AttendancesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiBody({ type: CreateAttendanceDto })
  @ApiResponse({ status: 201, description: 'Attendance created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendancesService.create(createAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiResponse({ status: 200, description: 'Returns all attendance records' })
  findAll() {
    return this.attendancesService.findAll();
  }

  @Get('office/:officeId')
  findAllByOffice(@Param('officeId') officeId: string) {
    return this.attendancesService.findAllByOffice(officeId);
  }

  @Post('office/:officeId')
  createForOffice(@Param('officeId') officeId: string, @Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendancesService.createForOffice(officeId, createAttendanceDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an attendance record by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Attendance record ID' })
  @ApiResponse({ status: 200, description: 'Returns the attendance record' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  findOne(@Param('id') id: string) {
    return this.attendancesService.findOne(id);
  }

  @Get('office/:officeId/:id')
  findOneByOffice(@Param('officeId') officeId: string, @Param('id') id: string) {
    return this.attendancesService.findOneByOffice(officeId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiParam({ name: 'id', type: String, description: 'Attendance record ID' })
  @ApiBody({ type: UpdateAttendanceDto })
  @ApiResponse({ status: 200, description: 'Attendance record updated' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendancesService.update(id, updateAttendanceDto);
  }

  @Patch('office/:officeId/:id')
  updateForOffice(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return this.attendancesService.updateForOffice(
      officeId,
      id,
      updateAttendanceDto as any,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attendance record' })
  @ApiParam({ name: 'id', type: String, description: 'Attendance record ID' })
  @ApiResponse({ status: 204, description: 'Attendance record deleted' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  remove(@Param('id') id: string) {
    return this.attendancesService.remove(id);
  }

  @Delete('office/:officeId/:id')
  removeForOffice(@Param('officeId') officeId: string, @Param('id') id: string) {
    return this.attendancesService.removeForOffice(officeId, id);
  }
}
