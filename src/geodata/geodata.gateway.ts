import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { GeoDataService } from './geodata.service';
import { trucks } from '../data/trucks';
import { geoDataTrucks } from '../data/tracks';
import { TruckSearchDto } from './dto/request/truck-search.dto';
import { TruckDto } from './dto/track.dto';

@WebSocketGateway()
export class GeoDataGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly getDataService: GeoDataService) {}

  @SubscribeMessage('truckList')
  async truckList(client: Socket): Promise<void> {
    this.logger.log(`Trying to retrive all trucks list!`);
    client.emit('trucks', trucks);
  }

  @SubscribeMessage('trackTravel')
  async trackTravel(client: Socket, payload: TruckSearchDto): Promise<void> {
    this.logger.log(`Trying to retrive tracks for ${payload.truck}`);

    const tracks = geoDataTrucks.find(
      (data) => data.id === payload.truck,
    ).track;

    tracks.map((track, index) => {
      this.emitWithDelay(client, index, track, payload.truck);
    });
  }

  public afterInit(server: Server): void {
    return this.logger.log('Init done for GeoData Gateway');
  }

  public emitWithDelay(
    client: Socket,
    index: number,
    track: TruckDto,
    truck: string,
  ): void {
    this.logger.log(
      `Sending track ${JSON.stringify(track)} for truck ${truck}`,
    );
    setTimeout(function () {
      client.emit('tracks', track);
    }, index * 5000);
  }
}
