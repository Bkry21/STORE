import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet — حماية الـ HTTP headers
  app.use(helmet());

  // CORS — السماح بس للـ app بتاعك
  app.enableCors({
    origin: '*', // هنغيرها بعدين للـ domain الحقيقي
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  // Validation — رفض أي بيانات غلط تلقائياً
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // يشيل أي fields زيادة
    forbidNonWhitelisted: true, // يرفض الـ request لو فيه fields غريبة
    transform: true, // يحول البيانات للنوع الصح تلقائياً
  }));

  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();