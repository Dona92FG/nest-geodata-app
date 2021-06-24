import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './geodata/socketio.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(helmet());
  app.useWebSocketAdapter(new SocketIoAdapter(app, true));
  await app.listen(3090);
}
bootstrap();
