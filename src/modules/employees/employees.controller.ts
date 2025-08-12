import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, VerifyOtpDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorator/public.decorator';

@ApiTags('Employees')
@ApiBearerAuth('JWT')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('invite')
  @ApiOperation({ summary: 'Invite a new employee (admin only)' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee invited successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  invite(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.inviteEmployee(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Returns all employees' })
  findAll() {
    return this.employeesService.findAll();
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify employee OTP' })
  @ApiResponse({ status: 200, description: 'OTP verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid OTP or email' })
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.employeesService.verifyOtp(body.email, body.otp);
  }

  @Get('office/:officeId')
  @ApiOperation({ summary: 'Get all employees by office' })
  @ApiParam({ name: 'officeId', type: String, description: 'Office ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns all employees in the specified office',
  })
  findAllByOffice(@Param('officeId') officeId: string) {
    return this.employeesService.findAllByOffice(officeId);
  }

  @Post('office/:officeId')
  @ApiOperation({ summary: 'Create a new employee for an office' })
  @ApiParam({ name: 'officeId', type: String, description: 'Office ID' })
  @ApiBody({ type: CreateEmployeeDto })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  createForOffice(
    @Param('officeId') officeId: string,
    @Body() createEmployeeDto: CreateEmployeeDto,
  ) {
    return this.employeesService.createForOffice(officeId, createEmployeeDto);
  }

  @Get('office/:officeId/:id')
  @ApiOperation({ summary: 'Get an employee by ID for an office' })
  @ApiParam({ name: 'officeId', type: String, description: 'Office ID' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Returns the employee' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOneByOffice(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
  ) {
    return this.employeesService.findOneByOffice(officeId, id);
  }

  @Patch('office/:officeId/:id')
  @ApiOperation({ summary: 'Update an employee for an office' })
  @ApiParam({ name: 'officeId', type: String, description: 'Office ID' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  updateForOffice(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.updateForOffice(
      officeId,
      id,
      updateEmployeeDto as any,
    );
  }

  @Delete('office/:officeId/:id')
  @ApiOperation({ summary: 'Delete an employee for an office' })
  @ApiParam({ name: 'officeId', type: String, description: 'Office ID' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiResponse({ status: 204, description: 'Employee deleted' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  removeForOffice(
    @Param('officeId') officeId: string,
    @Param('id') id: string,
  ) {
    return this.employeesService.removeForOffice(officeId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an employee by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Returns the employee' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiBody({ type: UpdateEmployeeDto })
  @ApiResponse({ status: 200, description: 'Employee updated' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee' })
  @ApiParam({ name: 'id', type: String, description: 'Employee ID' })
  @ApiResponse({ status: 204, description: 'Employee deleted' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }
}
