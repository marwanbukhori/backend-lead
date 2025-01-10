// import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
// import { User } from './user.entity';

// @Entity('chat_rooms')
// export class ChatRoom {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   name: string;

//   @Column('text', { nullable: true })
//   description: string;

//   @ManyToOne(() => User, user => user.created_rooms)
//   created_by: User;

//   @Column({ default: false })
//   is_private: boolean;

//   @CreateDateColumn()
//   created_at: Date;

//   @UpdateDateColumn()
//   updated_at: Date;

//   @OneToMany(() => ChatMessage, message => message.room)
//   messages: ChatMessage[];

//   @OneToMany(() => RoomMember, member => member.room)
//   members: RoomMember[];
// }

// @Entity('chat_messages')
// export class ChatMessage {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @ManyToOne(() => User, user => user.chat_messages)
//   user: User;

//   @ManyToOne(() => ChatRoom, room => room.messages)
//   room: ChatRoom;

//   @Column('text')
//   content: string;

//   @Column({ default: 'text' })
//   type: string;

//   @Column('jsonb', { default: {} })
//   metadata: Record<string, any>;

//   @CreateDateColumn()
//   created_at: Date;
// }

// @Entity('room_members')
// export class RoomMember {
//   @ManyToOne(() => ChatRoom, room => room.members, { primary: true })
//   room: ChatRoom;

//   @ManyToOne(() => User, { primary: true })
//   user: User;

//   @Column({ default: 'member' })
//   role: string;

//   @CreateDateColumn()
//   joined_at: Date;
// }
