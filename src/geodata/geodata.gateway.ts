import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
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

interface connectedClient {
  connected: boolean;
}

@WebSocketGateway()
export class GeoDataGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private clients = new Map<string, connectedClient>();
  private clientEmits = new Map<string, NodeJS.Timeout[]>();

  constructor(private readonly getDataService: GeoDataService) {}

  public handleConnection(client: Socket): void {
    client.emit('connected');
    this.clients.set(client.id, { connected: true });
    this.clientEmits.set(client.id, []);
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`#clients ${this.clients.size}`);
  }

  public handleDisconnect(client: Socket): void {
    client.emit('disconnected');
    this.clients.delete(client.id);
    this.clientEmits.delete(client.id);
    this.logger.log(`#clients ${this.clients.size}`);
    return this.logger.log(`Client disconnected: ${client.id}`);
  }

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

    this.clientEmits.get(client.id).forEach((timeout) => {
      clearTimeout(timeout);
    });

    this.clientEmits.set(client.id, []);

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
    const logger = this.logger;
    const timeout = setTimeout(function () {
      logger.log(`Sending track ${JSON.stringify(track)} for truck ${truck}`);
      client.emit('tracks', track);
    }, index * 3000);
    this.clientEmits.get(client.id).push(timeout);
  }
}
