import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('office/:officeId')
  findAllByOffice(@Param('officeId') officeId: string) {
    return this.usersService.findAllByOffice(officeId);
  }

  @Post('office/:officeId')
  createForOffice(@Param('officeId') officeId: string, @Body() createUserDto: CreateUserDto) {
    return this.usersService.createForOffice(officeId, createUserDto);
  }

  @Get('office/:officeId/:id')
  findOneByOffice(@Param('officeId') officeId: string, @Param('id') id: string) {
    return this.usersService.findOneByOffice(officeId, id);
  }

  @Patch('office/:officeId/:id')
  updateForOffice(@Param('officeId') officeId: string, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateForOffice(officeId, id, updateUserDto);
  }

  @Delete('office/:officeId/:id')
  removeForOffice(@Param('officeId') officeId: string, @Param('id') id: string) {
    return this.usersService.removeForOffice(officeId, id);
  }
}
