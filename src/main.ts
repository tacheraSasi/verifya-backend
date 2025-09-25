import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { SeederService } from 'src/modules/seeder/seeder.service';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { LoggingInterceptor } from 'src/common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { ValidationInterceptor } from 'src/common/interceptors/validate-response.interceptor';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector);
  const apiPrefix = '/api/v1';

  app.enableCors();
  app.use(helmet());
  app.setGlobalPrefix(apiPrefix, { exclude: ['/'] });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: false,
      exceptionFactory: errors => {
        const formattedErrors = errors.reduce(
          (acc: { [key: string]: any }, error) => {
            acc[error.property] = Object.values(error.constraints || {});
            return acc;
          },
          {} as { [key: string]: any },
        );
        return new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );

  app.useGlobalInterceptors(
    new ResponseTransformInterceptor(),
    new LoggingInterceptor(),
    new ValidationInterceptor(),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('app.name') || 'Default App Name')
    .setDescription(
      configService.get<string>('app.description') || 'Default App Description',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  // await app.get(SeederService).seed();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
