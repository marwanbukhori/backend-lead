// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { CqrsModule } from '@nestjs/cqrs';
// import { TasksController } from './tasks.controller';
// import { TasksService } from './tasks.service';
// import { Task } from '../../entities/task.entity';
// import { TaskEvent } from '../../entities/task-event.entity';
// import { TasksCommandHandlers } from './commands/handlers';
// import { TasksQueryHandlers } from './queries/handlers';
// import { TasksEventHandlers } from './events/handlers';
// import { TasksSagas } from './sagas/tasks.sagas';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Task, TaskEvent]),
//     CqrsModule,
//   ],
//   controllers: [TasksController],
//   providers: [
//     TasksService,
//     ...TasksCommandHandlers,
//     ...TasksQueryHandlers,
//     ...TasksEventHandlers,
//     TasksSagas,
//   ],
// })
// export class TasksModule {}
