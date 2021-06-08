import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeoDataModule } from './geodata/geodata.module';

@Module({
  imports: [GeoDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
