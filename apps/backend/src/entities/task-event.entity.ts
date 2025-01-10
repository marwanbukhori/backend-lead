// import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
// // import { Task } from './task.entity';
// import { User } from './user.entity';

// @Entity('task_events')
// export class TaskEvent {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @ManyToOne(() => Task, task => task.events)
//   task: Task;

//   @ManyToOne(() => User)
//   user: User;

//   @Column()
//   event_type: string;

//   @Column('jsonb')
//   payload: Record<string, any>;

//   @CreateDateColumn()
//   created_at: Date;
// }
