import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocsService } from './docs.service';

@ApiTags('Documentation')
@Controller('api/docs')
export class DocsController {
  constructor(private readonly docsService: DocsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search documentation content' })
  @ApiResponse({ status: 200, type: Array, description: 'Search results' })
  async searchDocs(@Query('query') query: string) {
    return this.docsService.search(query);
  }

  @Get('toc')
  @ApiOperation({ summary: 'Get table of contents' })
  @ApiResponse({ status: 200, type: Array, description: 'Table of contents structure' })
  async getTableOfContents() {
    return this.docsService.getTableOfContents();
  }

  @Get(':path(*)')
  @ApiOperation({ summary: 'Get documentation content' })
  @ApiResponse({ status: 200, type: Object, description: 'Documentation content' })
  async getDoc(@Param('path') path: string) {
    return this.docsService.getDocContent(path);
  }
}
