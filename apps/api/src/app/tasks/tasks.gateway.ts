import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class TasksGateway {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('TasksGateway');

    @SubscribeMessage('joinOrganization')
    handleJoinOrganization(@ConnectedSocket() client: Socket, @MessageBody() orgId: string) {
        client.join(orgId);
        this.logger.log(`Client ${client.id} joined org room: ${orgId}`);
    }
}