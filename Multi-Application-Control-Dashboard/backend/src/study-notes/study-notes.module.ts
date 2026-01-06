import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudyNotesService } from './study-notes.service';
import { StudyNotesController } from './study-notes.controller';
import { StudyNote, StudyNoteSchema } from './schemas/study-note.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: StudyNote.name, schema: StudyNoteSchema }])],
  controllers: [StudyNotesController],
  providers: [StudyNotesService],
  exports: [StudyNotesService],
})
export class StudyNotesModule {}
