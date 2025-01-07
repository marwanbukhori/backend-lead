import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/constants';
import { Content, ContentStatus } from './entities/content.entity';
import { CreateContentCommand } from './commands/create-content.command';
import { PublishContentCommand } from './commands/publish-content.command';
import { GetContentQuery } from './queries/get-content.query';
import { GetPublishedContentQuery } from './queries/get-published-content.query';

@ApiTags('content')
@Controller('content')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new content' })
  @ApiResponse({
    status: 201,
    description: 'Content created successfully',
    type: Content,
  })
  create(@Body() createContentDto: CreateContentDto) {
    return this.commandBus.execute(new CreateContentCommand(createContentDto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all content' })
  @ApiResponse({
    status: 200,
    description: 'List of content',
    type: [Content],
  })
  findAll() {
    return this.queryBus.execute(new GetPublishedContentQuery());
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published content' })
  @ApiResponse({
    status: 200,
    description: 'List of published content',
    type: [Content],
  })
  findPublished() {
    return this.queryBus.execute(new GetPublishedContentQuery());
  }

  @Get('by-topic/:topicId')
  @ApiOperation({ summary: 'Get content by topic' })
  @ApiResponse({
    status: 200,
    description: 'List of content in topic',
    type: [Content],
  })
  findByTopic(
    @Param('topicId') topicId: string,
    @Query('status') status?: ContentStatus,
  ) {
    return this.queryBus.execute(new GetPublishedContentQuery(topicId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by id' })
  @ApiResponse({
    status: 200,
    description: 'Content found',
    type: Content,
  })
  findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetContentQuery(id));
  }

  @Post(':id/publish')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Publish content' })
  @ApiResponse({
    status: 200,
    description: 'Content published successfully',
    type: Content,
  })
  publish(@Param('id') id: string) {
    return this.commandBus.execute(new PublishContentCommand(id));
  }
}
