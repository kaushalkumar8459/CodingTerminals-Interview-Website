import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StudyNotesService } from './study-notes.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('study-notes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StudyNotesController {
  constructor(private studyNotesService: StudyNotesService) {}

  @Post()
  @Roles('admin', 'super_admin')
  async createNote(@Body() createData: any, @Request() req) {
    const { title, content, category, createdBy, visibility } = createData;
    return this.studyNotesService.create(title, content, category, createdBy, visibility);
  }

  @Get()
  async getAllNotes(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: string,
    @Query('visibility') visibility?: string,
  ) {
    return await this.studyNotesService.getAllNotes(page, limit, userId, visibility);
  }

  @Get('featured')
  async getFeaturedNotes(@Query('limit') limit: number = 5) {
    return await this.studyNotesService.getFeaturedNotes(limit);
  }

  @Get('category/:category')
  async getNotesByCategory(
    @Param('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.studyNotesService.getNotesByCategory(category, page, limit);
  }

  @Get('search/:query')
  async searchNotes(
    @Param('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.studyNotesService.searchNotes(query, page, limit);
  }

  @Get('stats')
  async getStats() {
    return this.studyNotesService.getStats();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.studyNotesService.search(query);
  }

  @Get('user/:userId')
  async getByUser(@Param('userId') userId: string) {
    return this.studyNotesService.getByUser(userId);
  }

  @Get(':id')
  async getNoteById(@Param('id') noteId: string) {
    return await this.studyNotesService.getNoteById(noteId);
  }

  @Put(':id')
  @Roles('admin', 'super_admin')
  async updateNote(@Param('id') noteId: string, @Body() updateData: any, @Request() req) {
    return await this.studyNotesService.update(noteId, updateData, req.user.sub);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  async deleteNote(@Param('id') noteId: string) {
    return await this.studyNotesService.deleteNote(noteId);
  }
}
