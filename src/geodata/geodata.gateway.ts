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
  async trackTravel(client: Socket, payload: any): Promise<void> {
    this.logger.log(`Trying to retrive tracks for ${payload.truck}`);

    const tracks = geoDataTrucks.find(
      (data) => data.id === payload.truck,
    ).track;

    tracks.map((track, index) => {
      this.logger.log(`Sending track ${track} for truck ${payload.truck}`);
      this.emitWithDelay(client, index, track);
    });
  }

  public afterInit(server: Server): void {
    return this.logger.log('Init done for GeoData Gateway');
  }

  public emitWithDelay(client: Socket, index: number, data: any) {
    setTimeout(function () {
      client.emit('tracks', data);
    }, index * 5000);
  }
}
