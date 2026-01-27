import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { StudyNotesService } from './study-notes.service';
import { CreateStudyNoteDto, UpdateStudyNoteDto } from './dto/study-note.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequireModule, CanView, CanCreate, CanEdit, CanDelete } from '../auth/decorators/permissions.decorator';

@Controller('study-notes')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequireModule('Study Notes')
export class StudyNotesController {
  constructor(private studyNotesService: StudyNotesService) {}

  @Post()
  @CanCreate('Study Notes')
  async create(@Body() createStudyNoteDto: CreateStudyNoteDto, @Request() req) {
    return this.studyNotesService.create({ ...createStudyNoteDto, author: req.user.sub });
  }

  @Get()
  @CanView('Study Notes')
  async findAll(@Query('isPublic') isPublic?: boolean) {
    return this.studyNotesService.findAll(isPublic);
  }

  @Get('search')
  @CanView('Study Notes')
  async search(@Query('q') query: string) {
    return this.studyNotesService.search(query);
  }

  @Get('category/:category')
  @CanView('Study Notes')
  async findByCategory(@Param('category') category: string) {
    return this.studyNotesService.findByCategory(category);
  }

  @Get('stats')
  @CanView('Study Notes')
  async getStats() {
    return this.studyNotesService.getStats();
  }

  @Get('author/:authorId')
  @CanView('Study Notes')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.studyNotesService.findByAuthor(authorId);
  }

  @Get(':id')
  @CanView('Study Notes')
  async findOne(@Param('id') id: string) {
    return this.studyNotesService.findOne(id);
  }

  @Put(':id')
  @CanEdit('Study Notes')
  async update(@Param('id') id: string, @Body() updateStudyNoteDto: UpdateStudyNoteDto) {
    return this.studyNotesService.update(id, updateStudyNoteDto);
  }

  @Delete(':id')
  @CanDelete('Study Notes')
  async delete(@Param('id') id: string) {
    return this.studyNotesService.delete(id);
  }
}
