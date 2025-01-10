// import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Task } from '../../../../entities/task.entity';
// import { TaskEvent } from '../../../../entities/task-event.entity';
// import { CreateTaskCommand } from '../impl/create-task.command';
// import { TaskCreatedEvent } from '../../events/impl/task-created.event';

// @CommandHandler(CreateTaskCommand)
// export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
//   constructor(
//     @InjectRepository(Task)
//     private taskRepository: Repository<Task>,
//     @InjectRepository(TaskEvent)
//     private eventRepository: Repository<TaskEvent>,
//     private eventBus: EventBus,
//   ) {}

//   async execute(command: CreateTaskCommand) {
//     // Create task
//     const task = this.taskRepository.create({
//       title: command.title,
//       description: command.description,
//       status: 'pending',
//       priority: command.priority,
//       assigned_to: command.assignedTo,
//     });
//     await this.taskRepository.save(task);

//     // Create event
//     const event = this.eventRepository.create({
//       task,
//       event_type: 'TASK_CREATED',
//       payload: {
//         title: task.title,
//         description: task.description,
//         assignedTo: command.assignedTo,
//       },
//     });
//     await this.eventRepository.save(event);

//     // Publish event
//     this.eventBus.publish(new TaskCreatedEvent(task));

//     return task;
//   }
// }
