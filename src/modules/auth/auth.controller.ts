import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorator/public.decorator';
import { User } from 'src/modules/users/entities/user.entity';

@ApiTags('Auth')
@ApiBearerAuth('JWT')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Returns JWT token and user information',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const refreshToken = await this.authService.createRefreshToken(
      user,
      result.access_token,
    );
    return {
      ...result,
      refresh_token: refreshToken.token,
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new office' })
  @ApiResponse({
    status: 201,
    description: 'Office successfully created',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify user email with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }
}
