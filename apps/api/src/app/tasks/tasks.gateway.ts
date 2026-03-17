import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IOnlineUser } from '@Simple Task Management/data';

@WebSocketGateway({ cors: true })
export class TasksGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('TasksGateway');

    private activeConnections = new Map<string, { orgId: string, user: IOnlineUser }>();

    @SubscribeMessage('joinOrganization')
    handleJoinOrganization(@ConnectedSocket() client: Socket, @MessageBody() payload: { orgId: string, user: IOnlineUser }) {
        client.join(payload.orgId);
        this.activeConnections.set(client.id, payload);
        this.logger.log(`Client ${client.id} joined org room: ${payload.orgId} as ${payload.user.email}`);

        this.broadcastPresence(payload.orgId);
    }

    handleDisconnect(client: Socket) {
        const connection = this.activeConnections.get(client.id);
        if (connection) {
            this.activeConnections.delete(client.id);
            this.logger.log(`Client ${client.id} disconnected from org ${connection.orgId}`);
            this.broadcastPresence(connection.orgId);
        }
    }

    private broadcastPresence(orgId: string) {
        const usersInOrg = Array.from(this.activeConnections.values())
            .filter(conn => conn.orgId === orgId)
            .map(conn => conn.user);

        const uniqueUsers = Array.from(new Map(usersInOrg.map(u => [u.id, u])).values());

        this.server.to(orgId).emit('presenceUpdate', uniqueUsers);
    }
}