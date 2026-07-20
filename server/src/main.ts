import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('APP_PORT', 3001);
  const prefix = configService.get<string>('APP_PREFIX', '/api');

  // 安全中间件 - 配置CSP允许内联脚本和事件处理器
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'http://localhost:3001'],
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'http://localhost:3001'],
          fontSrc: ["'self'"],
        },
      },
    }),
  );
  app.use(compression());

  // 全局前缀
  app.setGlobalPrefix(prefix);

  // 跨域
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('磐枢工业智能平台 API')
    .setDescription('ERP / MES / PLM / WMS / HR 一体化平台接口文档')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${prefix}/docs`, app, document);

  await app.listen(port);
  logger.log(`应用已启动: http://localhost:${port}${prefix}`);
  logger.log(`API文档地址: http://localhost:${port}${prefix}/docs`);
  logger.log(`数据库类型: ${configService.get('DB_TYPE')}`);
}

bootstrap();
