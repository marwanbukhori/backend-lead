# WebSockets in NestJS

## Overview

WebSockets enable real-time, bidirectional communication between clients and servers. NestJS provides built-in support for WebSockets through the `@nestjs/websockets` package.

## Key Concepts

### 1. Basic WebSocket Gateway

```typescript
// chat/chat.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.server.emit('message', {
      sender: client.id,
      message: payload,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 2. Authentication & Authorization

```typescript
// auth/ws-auth.guard.ts
@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth.token;

    try {
      const user = await this.authService.validateToken(token);
      client['user'] = user;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}

// chat/chat.gateway.ts
@UseGuards(WsAuthGuard)
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('private-message')
  async handlePrivateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PrivateMessageDto,
  ) {
    const user = client['user'];
    // Handle private message logic
  }
}
```

### 3. Room Management

```typescript
// chat/chat.gateway.ts
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string): void {
    client.join(room);
    client.emit('joined', { room });
    client.to(room).emit('user-joined', { userId: client.id });
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string): void {
    client.leave(room);
    client.to(room).emit('user-left', { userId: client.id });
  }

  @SubscribeMessage('room-message')
  handleRoomMessage(
    client: Socket,
    payload: { room: string; message: string },
  ): void {
    client.to(payload.room).emit('room-message', {
      sender: client.id,
      message: payload.message,
      room: payload.room,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 4. Event Handling & Validation

```typescript
// chat/dto/message.dto.ts
export class MessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string;

  @IsString()
  @IsOptional()
  room?: string;
}

// chat/chat.gateway.ts
@UsePipes(new ValidationPipe())
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: MessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Process message
      return {
        event: 'message',
        data: {
          status: 'ok',
          message: 'Message sent successfully',
        },
      };
    } catch (error) {
      throw new WsException(error.message);
    }
  }
}
```

## Best Practices

### 1. Connection Management

```typescript
// chat/connection.service.ts
@Injectable()
export class ConnectionService {
  private readonly connectedClients = new Map<string, ConnectedClient>();

  addClient(clientId: string, client: ConnectedClient) {
    this.connectedClients.set(clientId, client);
  }

  removeClient(clientId: string) {
    this.connectedClients.delete(clientId);
  }

  getClient(clientId: string): ConnectedClient | undefined {
    return this.connectedClients.get(clientId);
  }

  getAllClients(): ConnectedClient[] {
    return Array.from(this.connectedClients.values());
  }
}

// chat/chat.gateway.ts
@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly connectionService: ConnectionService) {}

  handleConnection(client: Socket) {
    this.connectionService.addClient(client.id, {
      id: client.id,
      socket: client,
      connectedAt: new Date(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectionService.removeClient(client.id);
  }
}
```

### 2. Error Handling

```typescript
// chat/filters/ws-exception.filter.ts
@Catch()
export class WsExceptionFilter implements WsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof WsException) {
      client.emit('error', {
        status: 'error',
        message: exception.message,
      });
    } else if (exception instanceof Error) {
      client.emit('error', {
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          detail: exception.message,
        }),
      });
    }
  }
}
```

## Implementation Example

### Complete Chat System

```typescript
// chat/chat.module.ts
@Module({
  imports: [AuthModule, RedisModule],
  providers: [
    ChatGateway,
    ChatService,
    ConnectionService,
    {
      provide: APP_FILTER,
      useClass: WsExceptionFilter,
    },
  ],
})
export class ChatModule {}

// chat/chat.service.ts
@Injectable()
export class ChatService {
  constructor(
    private readonly redisService: RedisService,
    private readonly connectionService: ConnectionService,
  ) {}

  async saveMessage(message: ChatMessage): Promise<void> {
    await this.redisService.lpush(
      `chat:room:${message.room}:messages`,
      JSON.stringify(message),
    );
  }

  async getRoomMessages(room: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await this.redisService.lrange(
      `chat:room:${room}:messages`,
      0,
      limit - 1,
    );
    return messages.map((msg) => JSON.parse(msg));
  }
}

// chat/chat.gateway.ts
@UseFilters(new WsExceptionFilter())
@UsePipes(new ValidationPipe())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('ChatGateway');

  constructor(
    private readonly chatService: ChatService,
    private readonly connectionService: ConnectionService,
  ) {}

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    try {
      await this.chatService.joinRoom(client, data.room);

      // Get recent messages
      const messages = await this.chatService.getRoomMessages(data.room);

      // Send recent messages to the client
      client.emit('recent-messages', messages);

      // Notify room members
      client.to(data.room).emit('user-joined', {
        userId: client.id,
        room: data.room,
      });

      return { status: 'ok', room: data.room };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessageDto,
  ) {
    try {
      const user = client['user'];
      const message: ChatMessage = {
        id: uuid(),
        content: data.content,
        room: data.room,
        sender: {
          id: user.id,
          name: user.name,
        },
        timestamp: new Date().toISOString(),
      };

      // Save message
      await this.chatService.saveMessage(message);

      // Broadcast to room
      this.server.to(data.room).emit('new-message', message);

      return { status: 'ok', messageId: message.id };
    } catch (error) {
      throw new WsException(error.message);
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TypingDto,
  ) {
    client.to(data.room).emit('user-typing', {
      userId: client.id,
      room: data.room,
    });
  }
}
```

## Testing

```typescript
describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let app: INestApplication;
  let ioClient: Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ChatModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);

    // Create socket client
    ioClient = io('http://localhost:3000/chat', {
      auth: {
        token: 'test-token',
      },
    });
  });

  afterEach(async () => {
    ioClient.disconnect();
    await app.close();
  });

  it('should handle join room', (done) => {
    ioClient.emit('join-room', { room: 'test-room' });

    ioClient.on('recent-messages', (messages) => {
      expect(Array.isArray(messages)).toBe(true);
      done();
    });
  });

  it('should handle sending messages', (done) => {
    const testMessage = {
      content: 'Hello, World!',
      room: 'test-room',
    };

    ioClient.emit('send-message', testMessage);

    ioClient.on('new-message', (message) => {
      expect(message.content).toBe(testMessage.content);
      expect(message.room).toBe(testMessage.room);
      done();
    });
  });
});
```

## Key Takeaways

1. WebSocket Setup:

   - Configure CORS properly
   - Implement connection lifecycle
   - Handle authentication
   - Manage rooms effectively

2. Message Handling:

   - Validate incoming messages
   - Implement proper error handling
   - Store messages when needed
   - Handle different message types

3. Performance & Scaling:

   - Use Redis for pub/sub
   - Implement proper connection management
   - Handle reconnection scenarios
   - Monitor WebSocket performance

4. Best Practices:
   - Implement proper authentication
   - Handle disconnections gracefully
   - Validate incoming messages
   - Implement error handling
   - Use proper typing for messages
