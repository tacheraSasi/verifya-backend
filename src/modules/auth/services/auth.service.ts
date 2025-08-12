import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { Public } from 'src/modules/auth/decorator/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OfficesService } from 'src/modules/offices/offices.service';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private officesService: OfficesService,
    private notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.verifyPassword(pass))) {
      // const { password, ...result } = user;
      // return result;
      // Instead, just return user (password is not exposed in login payload)
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Removed email verification check

    const payload = { email: user.email, sub: user.id, role: user.userRole };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRole,
        office: user.office
          ? {
              id: user.office.id,
              name: user.office.name,
              latitude: user.office.latitude,
              longitude: user.office.longitude,
              createdAt: user.office.createdAt,
            }
          : null,
      },
    };
  }

  @Public()
  async register(registerDto: RegisterDto) {
    // Create office and admin user
    await this.officesService.create({
      name: registerDto.officeName,
      phoneNumber: registerDto.phoneNumber,
      adminEmail: registerDto.adminEmail,
      adminPassword: registerDto.adminPassword,
    });

    await this.notificationsService.sendSMS({
      phoneNumber: registerDto.phoneNumber,
      message: `Welcome to ekiliSync ${registerDto.officeName}! Your office and admin account have been created.`,
    });
    return { message: 'Office created successfully' };
  }

  @Public()
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    user.isVerified = true;
    user.verificationToken = '';
    await this.usersService.save(user);
    return { message: 'Email verified successfully' };
  }

  async createRefreshToken(
    user: User,
    access_token: string,
  ): Promise<RefreshToken> {
    const token = uuidv4() + '.' + uuidv4();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const refreshToken = this.refreshTokenRepository.create({
      token,
      expiresAt,
      user,
      userId: user.id,
      access_token,
    });
    return this.refreshTokenRepository.save(refreshToken);
  }

  async validateRefreshToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });
    if (
      !refreshToken ||
      refreshToken.revoked ||
      refreshToken.expiresAt < new Date()
    ) {
      return null;
    }
    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { revoked: true });
  }

  async refreshAccessToken(
    token: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const refreshToken = await this.validateRefreshToken(token);
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    await this.revokeRefreshToken(token);
    const user = refreshToken.user;
    const payload = { email: user.email, sub: user.id, role: user.userRole };
    const access_token = this.jwtService.sign(payload);
    const newRefreshToken = await this.createRefreshToken(user, access_token);
    return {
      access_token,
      refresh_token: newRefreshToken.token,
    };
  }
}
