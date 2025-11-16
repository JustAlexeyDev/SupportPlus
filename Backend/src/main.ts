import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Упрощенная CORS Configuration для разработки
  const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';

  if (isDevelopment) {
    // В режиме разработки разрешаем все origins
    app.enableCors({
      origin: true, // разрешает все origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'X-Content-Type-Options'
      ],
      exposedHeaders: ['Content-Range', 'X-Content-Range', 'Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 86400, // 24 часаsted-With', 'Accept', 'Origin'],
    });
    console.log('🔓 CORS: Development mode - all origins allowed');
  } else {
    // Production CORS настройка
    const corsOriginsEnv = configService.get<string>('CORS_ORIGINS');
    const allowedOrigins = corsOriginsEnv
      ? corsOriginsEnv.split(',').map(o => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001'];

    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    });
    console.log(`🔒 CORS: Production mode - allowed origins: ${allowedOrigins.join(', ')}`);
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const swaggerPath = configService.get<string>('SWAGGER_PATH') || 'api';
  const swaggerTitle = configService.get<string>('SWAGGER_TITLE') || 'SupportPlus API';
  const swaggerDescription = configService.get<string>('SWAGGER_DESCRIPTION') || 'SupportPlus Backend API with authentication, OAuth, and beneficiary categories management';
  const swaggerVersion = configService.get<string>('SWAGGER_VERSION') || '1.0';

  const config = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('beneficiary-categories', 'Beneficiary categories endpoints')
    .addTag('benefits', 'Benefits and commercial offers endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT') || 8000;
  const host = configService.get<string>('HOST') || '0.0.0.0';
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

  await app.listen(port, host);
  console.log(`🚀 Application is running on: http://${host}:${port}`);
  console.log(`📚 Swagger documentation available at: http://${host}:${port}/${swaggerPath}`);
  console.log(`🌐 Frontend URL: ${frontendUrl}`);

  if (isDevelopment) {
    console.log(`\n📱 Для доступа с телефона в локальной сети:`);
    console.log(`   Frontend: http://<ваш-локальный-IP>:3000`);
    console.log(`   Backend:  http://<ваш-локальный-IP>:${port}`);
    console.log(`\n🔓 CORS настроен для разрешения всех origins в режиме разработки`);
  }
}
bootstrap();