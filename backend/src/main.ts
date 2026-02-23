import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Todo-Lists API')
    .setDescription('Todo-Lists API for frontend interview')
    .setVersion('1.0')
    .build();
  app.enableCors({ allowedHeaders: ['content-type'], origin: 'http://localhost:5173', credentials: true, });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl: 'http://localhost:4000/assets/swagger-theme.css',
  });

  await app.listen(4000);
}
bootstrap();
