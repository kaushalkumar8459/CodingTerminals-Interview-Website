import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { StudyNotesService } from './study-notes.service';
import { CreateStudyNoteDto, UpdateStudyNoteDto } from './dto/study-note.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('study-notes')
@UseGuards(JwtAuthGuard)
export class StudyNotesController {
  constructor(private studyNotesService: StudyNotesService) {}

  @Post()
  async create(@Body() createStudyNoteDto: CreateStudyNoteDto, @Request() req) {
    return this.studyNotesService.create({ ...createStudyNoteDto, author: req.user.sub });
  }

  @Get()
  async findAll(@Query('isPublic') isPublic?: boolean) {
    return this.studyNotesService.findAll(isPublic);
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.studyNotesService.search(query);
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    return this.studyNotesService.findByCategory(category);
  }

  @Get('stats')
  async getStats() {
    return this.studyNotesService.getStats();
  }

  @Get('author/:authorId')
  async findByAuthor(@Param('authorId') authorId: string) {
    return this.studyNotesService.findByAuthor(authorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.studyNotesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateStudyNoteDto: UpdateStudyNoteDto) {
    return this.studyNotesService.update(id, updateStudyNoteDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.studyNotesService.delete(id);
  }
}
