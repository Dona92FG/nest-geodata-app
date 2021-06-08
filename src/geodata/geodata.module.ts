import { Module } from '@nestjs/common';
import { GeoDataGateway } from './geodata.gateway';
import { GeoDataService } from './geodata.service';

@Module({
  providers: [GeoDataGateway, GeoDataService],
})
export class GeoDataModule {}
