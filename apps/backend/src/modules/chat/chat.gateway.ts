// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { UseGuards } from '@nestjs/common';
// import { ChatService } from './chat.service';
// import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
// import { ChatMessage } from '../../entities/chat.entity';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// @UseGuards(WsJwtGuard)
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   constructor(private readonly chatService: ChatService) {}

//   async handleConnection(client: Socket) {
//     const user = client.data.user;
//     await this.chatService.userConnected(user.id);
//     client.join(`user:${user.id}`);
//   }

//   async handleDisconnect(client: Socket) {
//     const user = client.data.user;
//     await this.chatService.userDisconnected(user.id);
//     client.leave(`user:${user.id}`);
//   }

//   @SubscribeMessage('joinRoom')
//   async handleJoinRoom(client: Socket, roomId: string) {
//     const user = client.data.user;
//     await this.chatService.joinRoom(user.id, roomId);
//     client.join(`room:${roomId}`);
//     this.server.to(`room:${roomId}`).emit('userJoined', {
//       userId: user.id,
//       username: user.name,
//     });
//   }

//   @SubscribeMessage('leaveRoom')
//   async handleLeaveRoom(client: Socket, roomId: string) {
//     const user = client.data.user;
//     await this.chatService.leaveRoom(user.id, roomId);
//     client.leave(`room:${roomId}`);
//     this.server.to(`room:${roomId}`).emit('userLeft', {
//       userId: user.id,
//       username: user.name,
//     });
//   }

//   @SubscribeMessage('sendMessage')
//   async handleMessage(client: Socket, payload: { roomId: string; content: string }) {
//     const user = client.data.user;
//     const message = await this.chatService.createMessage(user.id, payload.roomId, payload.content);
//     this.server.to(`room:${payload.roomId}`).emit('newMessage', message);
//     return message;
//   }

//   @SubscribeMessage('typing')
//   async handleTyping(client: Socket, roomId: string) {
//     const user = client.data.user;
//     this.server.to(`room:${roomId}`).emit('userTyping', {
//       userId: user.id,
//       username: user.name,
//     });
//   }
// }
