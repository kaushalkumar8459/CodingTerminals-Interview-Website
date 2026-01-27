import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudyNote } from './schemas/study-note.schema';
import { CreateStudyNoteDto, UpdateStudyNoteDto } from './dto/study-note.dto';

@Injectable()
export class StudyNotesService {
  constructor(@InjectModel(StudyNote.name) private noteModel: Model<StudyNote>) {}

  async create(createStudyNoteDto: CreateStudyNoteDto) {
    const note = new this.noteModel(createStudyNoteDto);
    return note.save();
  }

  async findAll(isPublic?: boolean) {
    if (isPublic !== undefined) {
      return this.noteModel
        .find({ isPublic })
        .sort({ createdAt: -1 })
        .populate('author', 'email firstName lastName')
        .exec();
    }
    return this.noteModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author', 'email firstName lastName')
      .exec();
  }

  async findOne(id: string) {
    const note = await this.noteModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'email firstName lastName').exec();
    return note;
  }

  async update(id: string, updateStudyNoteDto: UpdateStudyNoteDto) {
    return this.noteModel
      .findByIdAndUpdate(id, updateStudyNoteDto, { new: true })
      .populate('author', 'email firstName lastName')
      .exec();
  }

  async delete(id: string) {
    return this.noteModel.findByIdAndDelete(id).exec();
  }

  async findByAuthor(authorId: string) {
    return this.noteModel.find({ author: authorId }).sort({ createdAt: -1 }).exec();
  }

  async search(query: string) {
    return this.noteModel
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { subject: { $regex: query, $options: 'i' } },
        ],
        isPublic: true,
      })
      .exec();
  }

  async findByCategory(category: string) {
    return this.noteModel.find({ category, isPublic: true }).sort({ createdAt: -1 }).exec();
  }

  async getStats() {
    const total = await this.noteModel.countDocuments();
    const public_notes = await this.noteModel.countDocuments({ isPublic: true });
    const private_notes = await this.noteModel.countDocuments({ isPublic: false });
    return { total, public_notes, private_notes };
  }
}
