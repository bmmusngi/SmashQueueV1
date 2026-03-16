import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  // When a Queue Master logs into a specific session
  @SubscribeMessage('joinSession')
  handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.sessionId);
    console.log(`Client ${client.id} joined session: ${data.sessionId}`);
    
    // Send a welcome message or current state back to the client
    client.emit('sessionJoined', { status: 'Success', sessionId: data.sessionId });
  }

  // When a player is dragged/dropped or a timer updates
  @SubscribeMessage('updateBoardState')
  handleBoardUpdate(
    @MessageBody() data: { sessionId: string; action: string; payload: any },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast the change to everyone ELSE in that specific queue session
    client.to(data.sessionId).emit('boardStateUpdated', data);
    console.log(`Board updated for session ${data.sessionId}: ${data.action}`);
  }
}
