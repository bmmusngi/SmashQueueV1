import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // This opens the gates so your tablet frontend can talk to the API
  app.enableCors({
    origin: '*', // For MVP, allow all connections (including your Tailscale IP)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  await app.listen(3000);
}
bootstrap();
