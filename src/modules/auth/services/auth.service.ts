import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Public } from 'src/modules/auth/decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.verifyPassword(pass))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  @Public()
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const payload = { email: user.email, sub: user.id, role: user.userRole };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRole,
      },
    };
  }

  @Public()
  async register(registerDto: RegisterDto): Promise<User> {
    return this.usersService.create(registerDto);
  }

  @Public()
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    user.isEmailVerified = true;
    user.verificationToken = '';
    await this.usersService.save(user);
    return { message: 'Email verified successfully' };
  }
}
