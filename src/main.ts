import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { initializeApp } from 'firebase-admin/app';

// Import firebase-admin


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    cors:{
      credentials: true,
      origin: 'http://localhost:3000'
    }
  });
  const config = new DocumentBuilder()
  .setTitle('Hệ thống quản lý kho Api')
  .setDescription('Dùng để quản lý kho')
  .setVersion('1.0')
  .addTag('best')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);

  await app.listen(5000);
}
bootstrap();
