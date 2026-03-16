import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS so the React frontend can communicate with the API
  app.enableCors({
    origin: '*', // For MVP. In production, restrict this to your specific NAS IP/Domain.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
  console.log(`Backend Application is running on: http://localhost:3000`);
}
bootstrap();
