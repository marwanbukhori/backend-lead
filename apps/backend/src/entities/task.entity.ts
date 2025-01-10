// import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
// import { User } from './user.entity';
// import { TaskEvent } from './task-event.entity';

// @Entity('tasks')
// export class Task {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   title: string;

//   @Column('text', { nullable: true })
//   description: string;

//   @Column({ default: 'pending' })
//   status: string;

//   @Column({ default: 'medium' })
//   priority: string;

//   @Column({ nullable: true })
//   due_date: Date;

//   @ManyToOne(() => User, user => user.assigned_tasks)
//   assigned_to: User;

//   @CreateDateColumn()
//   created_at: Date;

//   @UpdateDateColumn()
//   updated_at: Date;

//   @OneToMany(() => TaskEvent, event => event.task)
//   events: TaskEvent[];
// }
