// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChatGateway } from './chat.gateway';
// import { ChatService } from './chat.service';
// import { ChatController } from './chat.controller';
// import { ChatRoom, ChatMessage, RoomMember } from '../../entities/chat.entity';
// import { CacheModule } from '../cache/cache.module';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([ChatRoom, ChatMessage, RoomMember]),
//     CacheModule,
//   ],
//   providers: [ChatGateway, ChatService],
//   controllers: [ChatController],
// })
// export class ChatModule {}
