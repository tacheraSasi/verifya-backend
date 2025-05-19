import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from 'src/config/config.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { LoggerModule } from 'src/lib/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { JwtStrategy } from 'src/modules/auth/services/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    UsersModule,
    RolesModule,
    SeederModule,
    LoggerModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, JwtStrategy],
})
export class AppModule {}
