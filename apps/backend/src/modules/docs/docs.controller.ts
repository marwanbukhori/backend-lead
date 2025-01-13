import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  InternalServerErrorException,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocsService } from './docs.service';

@ApiTags('Documentation')
@Controller('api/docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @UseGuards(JwtAuthGuard)
  async getAllDocs(@Request() req) {
    return this.docsService.getAllDocs();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get document categories' })
  async getCategories() {
    return this.docsService.getCategories();
  }

  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user bookmarks' })
  async getBookmarks(@Request() req) {
    return this.docsService.getBookmarks(req.user.id);
  }

  @Post('bookmarks/:documentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a bookmark' })
  async addBookmark(
    @Request() req,
    @Param('documentId') documentId: string,
    @Body('notes') notes?: string,
  ) {
    return this.docsService.addBookmark(req.user.id, documentId, notes);
  }

  @Delete('bookmarks/:documentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove a bookmark' })
  async removeBookmark(
    @Request() req,
    @Param('documentId') documentId: string,
  ) {
    return this.docsService.removeBookmark(req.user.id, documentId);
  }

  @Put('bookmarks/order')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update bookmark order' })
  async updateBookmarkOrder(
    @Request() req,
    @Body('bookmarkIds') bookmarkIds: string[],
  ) {
    return this.docsService.updateBookmarkOrder(req.user.id, bookmarkIds);
  }

  @Get(':path(*)')
  @ApiOperation({ summary: 'Get a document by path' })
  async getDoc(@Param('path') path: string) {
    try {
      return await this.docsService.getDoc(`/${path}`);
    } catch (error) {
      console.error('Error fetching document:', error);
      if (error.message === 'Document not found') {
        throw new NotFoundException(`Document not found for path: ${path}`);
      }
      throw new InternalServerErrorException('Error fetching document');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new document' })
  async createDoc(@Body() doc: any) {
    return this.docsService.createDoc(doc);
  }

  @Put(':path(*)')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a document' })
  async updateDoc(@Param('path') path: string, @Body() doc: any) {
    return this.docsService.updateDoc(path, doc);
  }
}
